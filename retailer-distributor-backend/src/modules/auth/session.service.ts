import { AuthError, RefreshTokenReuseError } from "./auth.errors";
import type {
  RefreshSessionRepository,
  UserAccountRepository,
} from "./auth.repository";
import type { RefreshSession, UserRecord } from "./auth.types";
import { toPublicUser } from "./auth.user";
import type { TokenService } from "./token.service";

// Two tabs (or a retried request) can present the same refresh token at almost
// the same moment. Within this window after a rotation that counts as a
// concurrent refresh; after it, as reuse of a stolen token.
const REFRESH_REUSE_LEEWAY_MS = 10_000;

// The life of a signed-in session: started, continued by refresh, ended.
export class SessionService {
  constructor(
    private readonly sessions: RefreshSessionRepository,
    private readonly accounts: Pick<UserAccountRepository, "findUserById">,
    private readonly tokenService: Pick<
      TokenService,
      "createAccessToken" | "createRefreshToken" | "hashRefreshToken"
    >,
  ) {}

  async start(user: UserRecord) {
    const refreshToken = this.tokenService.createRefreshToken();
    await this.sessions.createRefreshSession(user.id, refreshToken);

    return this.sessionFor(user, refreshToken.token);
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);
    const session = await this.findUsableRefreshSession(tokenHash);
    const user = await this.accounts.findUserById(session.userId);
    if (!user) throw new AuthError("User no longer exists");
    const nextRefreshToken = this.tokenService.createRefreshToken();

    if (session.revokedAt) {
      // Another request rotated this token a moment ago; this one gets a
      // session of its own.
      await this.sessions.createRefreshSession(
        session.userId,
        nextRefreshToken,
      );
    } else {
      try {
        await this.sessions.rotateRefreshSession(
          session.id,
          session.userId,
          nextRefreshToken,
        );
      } catch (error) {
        if (!(error instanceof RefreshTokenReuseError)) throw error;

        // The token was consumed between the read above and the rotation.
        // Checking again tells a concurrent refresh apart from a logout.
        await this.findUsableRefreshSession(tokenHash);
        await this.sessions.createRefreshSession(
          session.userId,
          nextRefreshToken,
        );
      }
    }

    return this.sessionFor(user, nextRefreshToken.token);
  }

  async end(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    const session = await this.sessions.findRefreshSessionByTokenHash(
      this.tokenService.hashRefreshToken(rawRefreshToken),
    );
    if (session) await this.sessions.revokeRefreshToken(session.id);
  }

  private sessionFor(user: UserRecord, refreshToken: string) {
    return {
      accessToken: this.tokenService.createAccessToken(user.id, user.role),
      refreshToken,
      user: toPublicUser(user),
    };
  }

  // Returns the session a refresh may continue from. A session that is already
  // revoked is returned only when it was rotated within the leeway.
  private async findUsableRefreshSession(
    tokenHash: string,
  ): Promise<RefreshSession> {
    const session =
      await this.sessions.findRefreshSessionByTokenHash(tokenHash);
    if (!session) throw new AuthError("Invalid refresh token");

    if (session.revokedAt) {
      // Revoked without a replacement: a logout, or an earlier reuse detection.
      if (!session.replacedByTokenId)
        throw new AuthError("Refresh token is no longer valid");

      const rotatedAgoMs = Date.now() - session.revokedAt.getTime();
      if (rotatedAgoMs > REFRESH_REUSE_LEEWAY_MS) {
        await this.sessions.revokeAllRefreshTokensForUser(session.userId);
        throw new AuthError("Refresh token reuse detected");
      }

      return session;
    }

    if (session.expiresAt <= new Date()) {
      await this.sessions.revokeRefreshToken(session.id);
      throw new AuthError("Refresh token has expired");
    }

    return session;
  }
}

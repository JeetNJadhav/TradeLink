import { AuthError, RefreshTokenReuseError } from "./auth.errors";
import type { AuthRepository } from "./auth.repository";
import {
  AuthenticatedUser,
  RefreshSession,
  Role,
  UserRecord,
} from "./auth.types";
import type { PasswordHasher } from "./password.service";
import type { TokenService } from "./token.service";

// Two tabs (or a retried request) can present the same refresh token at almost
// the same moment. Within this window after a rotation that counts as a
// concurrent refresh; after it, as reuse of a stolen token.
const REFRESH_REUSE_LEEWAY_MS = 10_000;

const toAuthenticatedUser = (user: {
  id: string;
  role: Role;
}): AuthenticatedUser => ({
  userId: user.id,
  role: user.role,
});

// The user fields that are safe to send to the client.
const toPublicUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  organizationName: user.organizationName,
});

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async login(email: string, password: string) {
    // Emails are stored lowercase.
    const user = await this.authRepository.findUserByEmail(
      email.trim().toLowerCase(),
    );

    if (
      !user ||
      !(await this.passwordHasher.verify(password, user.password))
    )
      throw new AuthError("Invalid email or password");

    const authenticatedUser = toAuthenticatedUser(user);

    const accessToken = this.tokenService.createAccessToken(
      authenticatedUser.userId,
      authenticatedUser.role,
    );

    const refreshToken = this.tokenService.createRefreshToken();
    await this.authRepository.createRefreshSession(
      authenticatedUser.userId,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: toPublicUser(user),
    };
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);
    const session = await this.findUsableRefreshSession(tokenHash);
    const user = await this.authRepository.findUserById(session.userId);
    if (!user) throw new AuthError("User no longer exists");
    const authenticatedUser = toAuthenticatedUser(user);
    const nextRefreshToken = this.tokenService.createRefreshToken();

    if (session.revokedAt) {
      // Another request rotated this token a moment ago; this one gets a
      // session of its own.
      await this.authRepository.createRefreshSession(
        session.userId,
        nextRefreshToken,
      );
    } else {
      try {
        await this.authRepository.rotateRefreshSession(
          session.id,
          session.userId,
          nextRefreshToken,
        );
      } catch (error) {
        if (!(error instanceof RefreshTokenReuseError)) throw error;

        // The token was consumed between the read above and the rotation.
        // Checking again tells a concurrent refresh apart from a logout.
        await this.findUsableRefreshSession(tokenHash);
        await this.authRepository.createRefreshSession(
          session.userId,
          nextRefreshToken,
        );
      }
    }

    return {
      accessToken: this.tokenService.createAccessToken(
        authenticatedUser.userId,
        authenticatedUser.role,
      ),
      refreshToken: nextRefreshToken.token,
      user: toPublicUser(user),
    };
  }

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    const session = await this.authRepository.findRefreshSessionByTokenHash(
      this.tokenService.hashRefreshToken(rawRefreshToken),
    );
    if (session) await this.authRepository.revokeRefreshToken(session.id);
  }

  async getCurrentUser(authenticatedUser: AuthenticatedUser) {
    const user = await this.authRepository.findUserById(
      authenticatedUser.userId,
    );
    if (!user) throw new AuthError("User no longer exists");
    return toPublicUser(user);
  }

  // Returns the session a refresh may continue from. A session that is already
  // revoked is returned only when it was rotated within the leeway.
  private async findUsableRefreshSession(
    tokenHash: string,
  ): Promise<RefreshSession> {
    const session =
      await this.authRepository.findRefreshSessionByTokenHash(tokenHash);
    if (!session) throw new AuthError("Invalid refresh token");

    if (session.revokedAt) {
      // Revoked without a replacement: a logout, or an earlier reuse detection.
      if (!session.replacedByTokenId)
        throw new AuthError("Refresh token is no longer valid");

      const rotatedAgoMs = Date.now() - session.revokedAt.getTime();
      if (rotatedAgoMs > REFRESH_REUSE_LEEWAY_MS) {
        await this.authRepository.revokeAllRefreshTokensForUser(session.userId);
        throw new AuthError("Refresh token reuse detected");
      }

      return session;
    }

    if (session.expiresAt <= new Date()) {
      await this.authRepository.revokeRefreshToken(session.id);
      throw new AuthError("Refresh token has expired");
    }

    return session;
  }
}

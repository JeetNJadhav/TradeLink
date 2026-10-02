import {
  AccountConflictError,
  AuthError,
  RefreshTokenReuseError,
} from "./auth.errors";
import type { AuthRepository } from "./auth.repository";
import {
  AuthenticatedUser,
  RefreshSession,
  RegisterInput,
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

    return this.startSession(user);
  }

  // Creates the account only; the new user signs in afterwards.
  async register(input: RegisterInput) {
    const { password, ...details } = input;
    const email = input.email.trim().toLowerCase();

    if (await this.authRepository.findUserByEmail(email))
      throw new AuthError("Email is already registered", 409);
    if (await this.authRepository.findUserByPhone(input.phone))
      throw new AuthError("Phone number is already registered", 409);

    try {
      const user = await this.authRepository.createAccount({
        ...details,
        email,
        // Retailers have no contact info.
        contactInfo:
          input.role === "DISTRIBUTOR" ? input.contactInfo : undefined,
        passwordHash: await this.passwordHasher.hash(password),
      });

      return toPublicUser(user);
    } catch (error) {
      // Another sign-up took the email or phone after the checks above.
      if (error instanceof AccountConflictError)
        throw new AuthError(error.message, 409);
      throw error;
    }
  }

  // Ends every session of the user and starts a new one for the caller, so a
  // changed password signs out all other devices.
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new AuthError("User no longer exists");

    if (!(await this.passwordHasher.verify(currentPassword, user.password)))
      throw new AuthError("Current password is incorrect", 400);

    await this.authRepository.updatePassword(
      user.id,
      await this.passwordHasher.hash(newPassword),
    );
    await this.authRepository.revokeAllRefreshTokensForUser(user.id);

    return this.startSession(user);
  }

  private async startSession(user: UserRecord) {
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

import { AuthError, RefreshTokenReuseError } from "./auth.errors";
import type { AuthRepository } from "./auth.repository";
import { AuthenticatedUser, Role, UserRecord } from "./auth.types";
import type { PasswordHasher } from "./password.service";
import type { TokenService } from "./token.service";

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
});

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.authRepository.findUserByEmail(email);

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
    const session = await this.authRepository.findRefreshSessionByTokenHash(
      this.tokenService.hashRefreshToken(rawRefreshToken),
    );
    if (!session) throw new AuthError("Invalid refresh token");
    if (session.revokedAt) {
      if (session.replacedByTokenId)
        await this.authRepository.revokeAllRefreshTokensForUser(session.userId);
      throw new AuthError("Refresh token is no longer valid");
    }
    if (session.expiresAt <= new Date()) {
      await this.authRepository.revokeRefreshToken(session.id);
      throw new AuthError("Refresh token has expired");
    }
    const user = await this.authRepository.findUserById(session.userId);
    if (!user) throw new AuthError("User no longer exists");
    const authenticatedUser = toAuthenticatedUser(user);
    const nextRefreshToken = this.tokenService.createRefreshToken();
    try {
      await this.authRepository.rotateRefreshSession(
        session.id,
        session.userId,
        nextRefreshToken,
      );
    } catch (error) {
      if (error instanceof RefreshTokenReuseError) {
        await this.authRepository.revokeAllRefreshTokensForUser(session.userId);
        throw new AuthError("Refresh token reuse detected");
      }
      throw error;
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
}

import type {
  RefreshSession,
  RefreshTokenRecord,
  UserRecord,
} from "./auth.types";

export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserRecord | null>;

  findUserById(userId: string): Promise<UserRecord | null>;

  createRefreshSession(
    userId: string,
    token: RefreshTokenRecord,
  ): Promise<void>;

  findRefreshSessionByTokenHash(
    tokenHash: string,
  ): Promise<RefreshSession | null>;

  // Atomically revokes the old token and stores its replacement.
  // Throws RefreshTokenReuseError if the old token was already consumed.
  rotateRefreshSession(
    oldTokenId: string,
    userId: string,
    next: RefreshTokenRecord,
  ): Promise<void>;

  revokeRefreshToken(tokenId: string): Promise<void>;

  revokeAllRefreshTokensForUser(userId: string): Promise<void>;
}

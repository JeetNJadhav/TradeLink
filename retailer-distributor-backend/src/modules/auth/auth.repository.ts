import type {
  NewAccount,
  RefreshSession,
  RefreshTokenRecord,
  UserRecord,
} from "./auth.types";

export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserRecord | null>;

  findUserById(userId: string): Promise<UserRecord | null>;

  findUserByPhone(phone: string): Promise<UserRecord | null>;

  // Stores the user with its retailer or distributor profile and its location,
  // all or nothing. Throws AccountConflictError if the email or phone is taken.
  createAccount(account: NewAccount): Promise<UserRecord>;

  updatePassword(userId: string, passwordHash: string): Promise<void>;

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

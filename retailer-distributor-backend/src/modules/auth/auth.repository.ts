import type {
  NewAccount,
  RefreshSession,
  RefreshTokenRecord,
  UserRecord,
} from "./auth.types";

// Users and their credentials.
export interface UserAccountRepository {
  findUserByEmail(email: string): Promise<UserRecord | null>;

  findUserById(userId: string): Promise<UserRecord | null>;

  findUserByPhone(phone: string): Promise<UserRecord | null>;

  // Stores the user with its retailer or distributor profile and its location,
  // all or nothing. Throws AccountConflictError if the email or phone is taken.
  createAccount(account: NewAccount): Promise<UserRecord>;

  // Stores the new password and revokes every refresh token of the user, all
  // or nothing: a changed password never leaves an old session alive.
  changePassword(userId: string, passwordHash: string): Promise<void>;
}

// The refresh tokens behind signed-in sessions.
export interface RefreshSessionRepository {
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

// Both sides in one store, as the Prisma implementation provides them.
export interface AuthRepository
  extends UserAccountRepository,
    RefreshSessionRepository {}

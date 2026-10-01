// Must stay in sync with the UserRole enum in schema.prisma.
export const ROLES = ["RETAILER", "DISTRIBUTOR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];
export type AuthenticatedUser = { userId: string; role: Role };
export type AccessTokenClaims = { sub: string; role: Role; type: "access" };

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

export interface RefreshSession {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
}

// What gets stored for a refresh token. The raw token is never persisted.
export interface RefreshTokenRecord {
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenData extends RefreshTokenRecord {
  token: string;
}

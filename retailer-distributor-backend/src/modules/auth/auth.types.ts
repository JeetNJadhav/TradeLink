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
  // The retailer's shop name or the distributor's business name; null for
  // users without such a profile (e.g. admins).
  organizationName: string | null;
}

// Roles a person can sign up as. Admins are not self-registered.
export const REGISTRATION_ROLES = ["RETAILER", "DISTRIBUTOR"] as const;
export type RegistrationRole = (typeof REGISTRATION_ROLES)[number];

export interface AccountLocation {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface RegisterInput {
  role: RegistrationRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  // The retailer's shop name or the distributor's business name.
  organizationName: string;
  // Distributors only.
  contactInfo?: string;
  location: AccountLocation;
}

// What gets stored for a new account. The raw password is never persisted.
export interface NewAccount extends Omit<RegisterInput, "password"> {
  passwordHash: string;
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

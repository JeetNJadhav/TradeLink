// Must stay in sync with the UserRole enum in schema.prisma.
export const ROLES = ["RETAILER", "DISTRIBUTOR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];
export type AuthenticatedUser = { userId: string; role: Role };
export type AccessTokenClaims = { sub: string; role: Role; type: "access" };

export const ROLES = ["RETAILER", "DISTRIBUTOR"] as const;
export type Role = (typeof ROLES)[number];
export type AuthenticatedUser = { userId: string; role: Role };
export type AccessTokenClaims = { sub: string; role: Role; type: "access" };

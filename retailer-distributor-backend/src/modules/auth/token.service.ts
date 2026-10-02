import type { AccessTokenClaims, RefreshTokenData, Role } from "./auth.types";

export interface TokenService {
  createAccessToken(userId: string, role: Role): string;

  verifyAccessToken(token: string): AccessTokenClaims;

  createRefreshToken(): RefreshTokenData;

  hashRefreshToken(token: string): string;
}

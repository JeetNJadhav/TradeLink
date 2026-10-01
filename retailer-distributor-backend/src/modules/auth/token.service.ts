import crypto from "node:crypto";

import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import {
  AccessTokenClaims,
  RefreshTokenData,
  Role,
  ROLES,
} from "./auth.types";

export interface TokenService {
  createAccessToken(userId: string, role: Role): string;

  verifyAccessToken(token: string): AccessTokenClaims;

  createRefreshToken(): RefreshTokenData;

  hashRefreshToken(token: string): string;
}

export interface JwtTokenOptions {
  accessTokenTtl: StringValue;
  refreshTokenTtlMs: number;
  getSecret: () => string;
}

export class JwtTokenService implements TokenService {
  constructor(private readonly options: JwtTokenOptions) {}

  createAccessToken(userId: string, role: Role): string {
    return jwt.sign(
      {
        sub: userId,
        role,
        type: "access",
      },
      this.options.getSecret(),
      {
        expiresIn: this.options.accessTokenTtl,
        algorithm: "HS256",
      },
    );
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    const decoded = jwt.verify(token, this.options.getSecret(), {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload & {
      role?: Role;
      type?: string;
    };

    if (
      typeof decoded.sub !== "string" ||
      !(ROLES as readonly string[]).includes(decoded.role ?? "") ||
      decoded.type !== "access"
    ) {
      throw new Error("Invalid access token claims");
    }

    return {
      sub: decoded.sub,
      role: decoded.role as Role,
      type: "access",
    };
  }

  createRefreshToken(): RefreshTokenData {
    const token = crypto.randomBytes(64).toString("base64url");

    return {
      token,
      tokenHash: this.hashRefreshToken(token),
      expiresAt: new Date(Date.now() + this.options.refreshTokenTtlMs),
    };
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

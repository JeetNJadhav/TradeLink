import crypto from "node:crypto";

import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import { AccessTokenClaims, Role } from "./auth.types";

const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

const ACCESS_TOKEN_TTL = getEnv("ACCESS_TOKEN_TTL") as StringValue;

const REFRESH_TOKEN_TTL_DAYS = Number(getEnv("REFRESH_TOKEN_TTL_DAYS"));

if (!Number.isFinite(REFRESH_TOKEN_TTL_DAYS) || REFRESH_TOKEN_TTL_DAYS <= 0) {
  throw new Error("REFRESH_TOKEN_TTL_DAYS must be a positive number");
}

const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

const getJwtSecret = () => getEnv("JWT_ACCESS_SECRET");

export const createAccessToken = (userId: string, role: Role) =>
  jwt.sign(
    {
      sub: userId,
      role,
      type: "access",
    },
    getJwtSecret(),
    {
      expiresIn: ACCESS_TOKEN_TTL,
      algorithm: "HS256",
    },
  );

export const verifyAccessToken = (token: string): AccessTokenClaims => {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload & {
    role?: Role;
    type?: string;
  };

  if (
    typeof decoded.sub !== "string" ||
    !["RETAILER", "DISTRIBUTOR"].includes(decoded.role ?? "") ||
    decoded.type !== "access"
  ) {
    throw new Error("Invalid access token claims");
  }

  return {
    sub: decoded.sub,
    role: decoded.role as Role,
    type: "access",
  };
};

export const createRefreshToken = () => {
  const token = crypto.randomBytes(64).toString("base64url");

  return {
    token,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  };
};

export const hashRefreshToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const REFRESH_COOKIE_MAX_AGE_SECONDS = REFRESH_TOKEN_TTL_MS / 1000;

export const ACCESS_TOKEN_TTL_SECONDS = Number(
  process.env.ACCESS_TOKEN_TTL_SECONDS || 900,
);

export const ACCESS_COOKIE_MAX_AGE_SECONDS = ACCESS_TOKEN_TTL_SECONDS;

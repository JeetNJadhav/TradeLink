import type { StringValue } from "ms";

const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

// Tokens
export const ACCESS_TOKEN_TTL = getEnv("ACCESS_TOKEN_TTL") as StringValue;

const REFRESH_TOKEN_TTL_DAYS = Number(getEnv("REFRESH_TOKEN_TTL_DAYS"));

if (!Number.isFinite(REFRESH_TOKEN_TTL_DAYS) || REFRESH_TOKEN_TTL_DAYS <= 0) {
  throw new Error("REFRESH_TOKEN_TTL_DAYS must be a positive number");
}

export const REFRESH_TOKEN_TTL_MS =
  REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export const getJwtSecret = () => getEnv("JWT_ACCESS_SECRET");

// Cookies
export const ACCESS_COOKIE_NAME =
  process.env.ACCESS_COOKIE_NAME || "accessToken";

export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME || "refreshToken";

export const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "csrfToken";

export const CSRF_HEADER_NAME = process.env.CSRF_HEADER_NAME || "x-csrf-token";

export const COOKIE_SAME_SITE = (process.env.COOKIE_SAMESITE || "Strict") as
  | "Strict"
  | "Lax"
  | "None";

export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";

export const ACCESS_COOKIE_MAX_AGE_SECONDS = Number(
  process.env.ACCESS_TOKEN_TTL_SECONDS || 900,
);

export const REFRESH_COOKIE_MAX_AGE_SECONDS = REFRESH_TOKEN_TTL_MS / 1000;

import type { StringValue } from "ms";
import { env } from "./env";

// Tokens
export const ACCESS_TOKEN_TTL = env.ACCESS_TOKEN_TTL as StringValue;

export const REFRESH_TOKEN_TTL_MS =
  env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export const getJwtSecret = () => env.JWT_ACCESS_SECRET;

// Cookies
export const ACCESS_COOKIE_NAME = env.ACCESS_COOKIE_NAME;

export const REFRESH_COOKIE_NAME = env.REFRESH_COOKIE_NAME;

export const CSRF_COOKIE_NAME = env.CSRF_COOKIE_NAME;

export const CSRF_HEADER_NAME = env.CSRF_HEADER_NAME;

export const COOKIE_SAME_SITE = env.COOKIE_SAMESITE;

export const COOKIE_SECURE = env.COOKIE_SECURE === "true";

export const ACCESS_COOKIE_MAX_AGE_SECONDS = env.ACCESS_TOKEN_TTL_SECONDS;

export const REFRESH_COOKIE_MAX_AGE_SECONDS = REFRESH_TOKEN_TTL_MS / 1000;

import { ResponseToolkit } from "@hapi/hapi";

import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  ACCESS_COOKIE_NAME,
  COOKIE_SAME_SITE,
  COOKIE_SECURE,
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
} from "../../config/auth.config";
import { COOKIE_PATHS } from "../../config/routes";

/**
 * Access token cookie.
 *
 * Sent to all backend routes because the access token
 * is required for protected APIs.
 */
const accessCookieOptions = () => ({
  ttl: ACCESS_COOKIE_MAX_AGE_SECONDS * 1000,
  isHttpOnly: true,
  isSecure: COOKIE_SECURE,
  isSameSite: COOKIE_SAME_SITE,
  path: COOKIE_PATHS.ROOT,
});

/**
 * Refresh token cookie.
 *
 * Restricted to /auth routes because the refresh token
 * is only required by authentication endpoints.
 */
const refreshCookieOptions = () => ({
  ttl: REFRESH_COOKIE_MAX_AGE_SECONDS * 1000,
  isHttpOnly: true,
  isSecure: COOKIE_SECURE,
  isSameSite: COOKIE_SAME_SITE,
  path: COOKIE_PATHS.AUTH,
});

/**
 * CSRF cookie.
 *
 * This MUST NOT be HttpOnly because the frontend needs
 * to read it and send it back in the CSRF header.
 */
const csrfCookieOptions = () => ({
  ttl: REFRESH_COOKIE_MAX_AGE_SECONDS * 1000,
  isHttpOnly: false,
  isSecure: COOKIE_SECURE,
  isSameSite: COOKIE_SAME_SITE,
  path: COOKIE_PATHS.ROOT,
});

export const setAuthCookies = (
  h: ResponseToolkit,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string },
): void => {
  h.state(ACCESS_COOKIE_NAME, tokens.accessToken, accessCookieOptions());
  h.state(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions());
  h.state(CSRF_COOKIE_NAME, tokens.csrfToken, csrfCookieOptions());
};

export const clearAuthCookies = (h: ResponseToolkit): void => {
  h.unstate(ACCESS_COOKIE_NAME, { path: COOKIE_PATHS.ROOT });
  h.unstate(REFRESH_COOKIE_NAME, { path: COOKIE_PATHS.AUTH });
  h.unstate(CSRF_COOKIE_NAME, { path: COOKIE_PATHS.ROOT });
};

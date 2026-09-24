import { Request, ResponseToolkit } from "@hapi/hapi";
import crypto from "crypto";

import {
  AuthError,
  getCurrentUser,
  login,
  logout,
  refresh,
} from "./auth.service";

import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
} from "./token.service";

const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || "accessToken";

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refreshToken";

const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "csrfToken";

const CSRF_HEADER_NAME = process.env.CSRF_HEADER_NAME || "x-csrf-token";

const IS_SAME_SITE = (process.env.COOKIE_SAMESITE || "Strict") as
  | "Strict"
  | "Lax"
  | "None";

const IS_SECURE = process.env.COOKIE_SECURE === "true";

/**
 * Access token cookie.
 *
 * Sent to all backend routes because the access token
 * is required for protected APIs.
 */
const accessCookieOptions = () => ({
  ttl: ACCESS_COOKIE_MAX_AGE_SECONDS * 1000,
  isHttpOnly: true,
  isSecure: IS_SECURE,
  isSameSite: IS_SAME_SITE,
  path: "/",
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
  isSecure: IS_SECURE,
  isSameSite: IS_SAME_SITE,
  path: "/auth",
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
  isSecure: IS_SECURE,
  isSameSite: IS_SAME_SITE,
  path: "/",
});

/**
 * Set access token cookie.
 */
const setAccessCookie = (h: ResponseToolkit, accessToken: string): void => {
  h.state(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions());
};

/**
 * Set refresh token cookie.
 */
const setRefreshCookie = (h: ResponseToolkit, refreshToken: string): void => {
  h.state(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
};

/**
 * Set CSRF cookie.
 */
const setCsrfCookie = (h: ResponseToolkit, csrfToken: string): void => {
  h.state(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions());
};

/**
 * Clear access token cookie.
 */
const clearAccessCookie = (h: ResponseToolkit): void => {
  h.unstate(ACCESS_COOKIE_NAME, {
    path: "/",
  });
};

/**
 * Clear refresh token cookie.
 */
const clearRefreshCookie = (h: ResponseToolkit): void => {
  h.unstate(REFRESH_COOKIE_NAME, {
    path: "/auth",
  });
};

/**
 * Clear CSRF cookie.
 */
const clearCsrfCookie = (h: ResponseToolkit): void => {
  h.unstate(CSRF_COOKIE_NAME, {
    path: "/",
  });
};

/**
 * Generate a CSRF token.
 */
const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Validate CSRF token.
 *
 * This should be called for state-changing requests:
 *
 * POST
 * PUT
 * PATCH
 * DELETE
 */
export const validateCsrfToken = (request: Request): void => {
  const csrfCookie = request.state[CSRF_COOKIE_NAME] as string | undefined;

  const csrfHeader = request.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw new AuthError("Invalid CSRF token", 403);
  }
};

/**
 * LOGIN
 *
 * Access token  -> HttpOnly cookie
 * Refresh token -> HttpOnly cookie
 * CSRF token    -> readable cookie
 *
 * Access/refresh tokens are NOT returned to React.
 */
export const loginHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const { email, password } = request.payload as {
      email: string;
      password: string;
    };

    const result = await login(email, password);

    const csrfToken = generateCsrfToken();

    setAccessCookie(h, result.accessToken);
    setRefreshCookie(h, result.refreshToken);
    setCsrfCookie(h, csrfToken);

    return h.response({
      success: true,
      data: {
        user: result.authenticatedUser,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return h
        .response({
          success: false,
          error: {
            message: error.message,
          },
        })
        .code(error.statusCode);
    }

    throw error;
  }
};

/**
 * REFRESH
 *
 * Refresh token is read from HttpOnly cookie.
 *
 * New access token -> HttpOnly cookie
 * New refresh token -> HttpOnly cookie
 */
export const refreshHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const refreshToken = request.state[REFRESH_COOKIE_NAME] as
      | string
      | undefined;

    if (!refreshToken) {
      throw new AuthError("Refresh token is required");
    }

    const result = await refresh(refreshToken);

    const csrfToken = generateCsrfToken();

    setAccessCookie(h, result.accessToken);
    setRefreshCookie(h, result.refreshToken);
    setCsrfCookie(h, csrfToken);

    return h.response({
      success: true,
      data: {
        user: result.authenticatedUser,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      clearAccessCookie(h);
      clearRefreshCookie(h);
      clearCsrfCookie(h);

      return h
        .response({
          success: false,
          error: {
            message: error.message,
          },
        })
        .code(error.statusCode);
    }

    throw error;
  }
};

/**
 * LOGOUT
 */
export const logoutHandler = async (request: Request, h: ResponseToolkit) => {
  const refreshToken = request.state[REFRESH_COOKIE_NAME] as string | undefined;

  if (refreshToken) {
    await logout(refreshToken);
  }

  clearAccessCookie(h);
  clearRefreshCookie(h);
  clearCsrfCookie(h);

  return h.response({
    success: true,
    data: {
      loggedOut: true,
    },
  });
};

/**
 * CURRENT USER
 */
export const meHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const authenticatedUser = request.app.authenticatedUser;

    if (!authenticatedUser) {
      return h
        .response({
          success: false,
          error: {
            message: "Authentication required",
          },
        })
        .code(401);
    }

    const user = await getCurrentUser(authenticatedUser);

    return h.response({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return h
        .response({
          success: false,
          error: {
            message: error.message,
          },
        })
        .code(error.statusCode);
    }

    throw error;
  }
};

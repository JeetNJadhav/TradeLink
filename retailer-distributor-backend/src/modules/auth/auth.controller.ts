import { Request, ResponseToolkit } from "@hapi/hapi";

import { REFRESH_COOKIE_NAME } from "../../config/auth.config";
import { successResponse } from "../../utils/response";
import { clearAuthCookies, setAuthCookies } from "./auth.cookies";
import { AuthError } from "./auth.errors";
import { AuthService } from "./auth.service";
import type { RegisterInput } from "./auth.types";
import { generateCsrfToken } from "./csrf.service";

/**
 * LOGIN
 *
 * Access token  -> HttpOnly cookie
 * Refresh token -> HttpOnly cookie
 * CSRF token    -> readable cookie + response body
 *
 * Access/refresh tokens are NOT returned to React. The CSRF token is, so the
 * client can still send the header when it cannot read the cookie (cross-site).
 */
export const createLoginHandler =
  (authService: AuthService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { email, password } = request.payload as {
      email: string;
      password: string;
    };

    const result = await authService.login(email, password);

    const csrfToken = generateCsrfToken();

    setAuthCookies(h, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken,
    });

    return successResponse(h, { user: result.user, csrfToken });
  };

/**
 * REGISTER
 *
 * Creates the account and sets no cookies: the new user signs in afterwards.
 */
export const createRegisterHandler =
  (authService: AuthService) =>
  async (request: Request, h: ResponseToolkit) => {
    const user = await authService.register(request.payload as RegisterInput);

    return successResponse(h, { user }, 201);
  };

/**
 * CHANGE PASSWORD
 *
 * Every other session of the user is ended; this one continues on new tokens.
 */
export const createChangePasswordHandler =
  (authService: AuthService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { currentPassword, newPassword } = request.payload as {
      currentPassword: string;
      newPassword: string;
    };
    const { userId } = request.auth.credentials;

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    const csrfToken = generateCsrfToken();

    setAuthCookies(h, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken,
    });

    return successResponse(h, { user: result.user, csrfToken });
  };

/**
 * REFRESH
 *
 * Refresh token is read from HttpOnly cookie.
 *
 * New access token -> HttpOnly cookie
 * New refresh token -> HttpOnly cookie
 */
export const createRefreshHandler =
  (authService: AuthService) =>
  async (request: Request, h: ResponseToolkit) => {
    try {
      const refreshToken = request.state[REFRESH_COOKIE_NAME] as
        | string
        | undefined;

      if (!refreshToken) {
        throw new AuthError("Refresh token is required");
      }

      const result = await authService.refresh(refreshToken);

      const csrfToken = generateCsrfToken();

      setAuthCookies(h, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        csrfToken,
      });

      return successResponse(h, { user: result.user, csrfToken });
    } catch (error) {
      // A failed refresh ends the session; the error handler builds the response.
      if (error instanceof AuthError) {
        clearAuthCookies(h);
      }

      throw error;
    }
  };

/**
 * LOGOUT
 */
export const createLogoutHandler =
  (authService: AuthService) =>
  async (request: Request, h: ResponseToolkit) => {
    const refreshToken = request.state[REFRESH_COOKIE_NAME] as
      | string
      | undefined;

    await authService.logout(refreshToken);

    clearAuthCookies(h);

    return successResponse(h, { loggedOut: true });
  };

/**
 * CURRENT USER
 */
export const createMeHandler =
  (authService: AuthService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { userId, role } = request.auth.credentials;

    const user = await authService.getCurrentUser({ userId, role });

    return successResponse(h, { user });
  };

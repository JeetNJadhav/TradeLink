import { Request, ResponseToolkit } from "@hapi/hapi";

import { REFRESH_COOKIE_NAME } from "../../config/auth.config";
import { successResponse } from "../../utils/response";
import { clearAuthCookies, setAuthCookies } from "./auth.cookies";
import { AuthError } from "./auth.errors";
import { AuthService } from "./auth.service";
import type { RegisterInput } from "./auth.types";
import { generateCsrfToken } from "./csrf.service";
import { RegistrationService } from "./registration.service";

type Session = Awaited<ReturnType<AuthService["login"]>>;

/**
 * Hands a new session to the browser.
 *
 * Access token  -> HttpOnly cookie
 * Refresh token -> HttpOnly cookie
 * CSRF token    -> readable cookie + response body
 *
 * Access/refresh tokens are NOT returned to React. The CSRF token is, so the
 * client can still send the header when it cannot read the cookie (cross-site).
 */
const respondWithSession = (h: ResponseToolkit, session: Session) => {
  const csrfToken = generateCsrfToken();

  setAuthCookies(h, {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    csrfToken,
  });

  return successResponse(h, { user: session.user, csrfToken });
};

/**
 * LOGIN
 */
export const createLoginHandler =
  (authService: AuthService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { email, password } = request.payload as {
      email: string;
      password: string;
    };

    return respondWithSession(h, await authService.login(email, password));
  };

/**
 * REGISTER
 *
 * Creates the account and sets no cookies: the new user signs in afterwards.
 */
export const createRegisterHandler =
  (registrationService: RegistrationService) =>
  async (request: Request, h: ResponseToolkit) => {
    const user = await registrationService.register(
      request.payload as RegisterInput,
    );

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

    return respondWithSession(
      h,
      await authService.changePassword(userId, currentPassword, newPassword),
    );
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

      return respondWithSession(h, await authService.refresh(refreshToken));
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

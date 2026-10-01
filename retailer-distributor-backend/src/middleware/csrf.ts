import { Request, ResponseToolkit } from "@hapi/hapi";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "../config/auth.config";
import { isValidCsrfToken } from "../modules/auth/csrf.service";

/**
 * Should be applied to state-changing requests (POST, PUT, PATCH, DELETE).
 */
export const requireCsrf = (request: Request, h: ResponseToolkit) => {
  const csrfCookie = request.state[CSRF_COOKIE_NAME] as string | undefined;
  const csrfHeader = request.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!isValidCsrfToken(csrfCookie, csrfHeader)) {
    return h
      .response({ success: false, error: { message: "Invalid CSRF token" } })
      .code(403)
      .takeover();
  }

  return h.continue;
};

import { Request, ResponseToolkit } from "@hapi/hapi";
import { validateCsrfToken } from "../modules/auth/auth.controller";

export const requireCsrf = (request: Request, h: ResponseToolkit) => {
  try {
    validateCsrfToken(request);
    return h.continue;
  } catch {
    return h
      .response({ success: false, error: { message: "Invalid CSRF token" } })
      .code(403)
      .takeover();
  }
};

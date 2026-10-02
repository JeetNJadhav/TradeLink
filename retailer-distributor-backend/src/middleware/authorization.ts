import { Request, ResponseToolkit } from "@hapi/hapi";
import { Role } from "../modules/auth/auth.types";
import { errorResponse } from "../utils/response";
export const requireRole =
  (...allowedRoles: Role[]) =>
  (request: Request, h: ResponseToolkit) => {
    const user = request.auth.credentials;
    if (!user)
      return errorResponse(h, "Authentication required", 401).takeover();
    if (!allowedRoles.includes(user.role))
      return errorResponse(h, "Forbidden", 403).takeover();
    return h.continue;
  };

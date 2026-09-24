import { Request, ResponseToolkit } from "@hapi/hapi";
import { Role } from "../modules/auth/auth.types";
export const requireRole =
  (...allowedRoles: Role[]) =>
  (request: Request, h: ResponseToolkit) => {
    const user = request.app.authenticatedUser;
    if (!user)
      return h
        .response({
          success: false,
          error: { message: "Authentication required" },
        })
        .code(401)
        .takeover();
    if (!allowedRoles.includes(user.role))
      return h
        .response({ success: false, error: { message: "Forbidden" } })
        .code(403)
        .takeover();
    return h.continue;
  };

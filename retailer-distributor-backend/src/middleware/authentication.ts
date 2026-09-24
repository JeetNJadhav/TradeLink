import { Request, ResponseToolkit } from "@hapi/hapi";
import { verifyAccessToken } from "../modules/auth/token.service";

const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || "accessToken";

const unauthorized = (h: ResponseToolkit, message: string) =>
  h.response({ success: false, error: { message } }).code(401).takeover();

export const requireAuthentication = (request: Request, h: ResponseToolkit) => {
  const token = request.state[ACCESS_COOKIE_NAME] as string | undefined;

  if (!token) return unauthorized(h, "Authentication required");

  try {
    const claims = verifyAccessToken(token);
    request.app.authenticatedUser = { userId: claims.sub, role: claims.role };
    return h.continue;
  } catch {
    return unauthorized(h, "Invalid or expired access token");
  }
};

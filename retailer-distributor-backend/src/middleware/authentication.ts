import { Request, ResponseToolkit, Server } from "@hapi/hapi";
import { verifyAccessToken } from "../modules/auth/token.service";
import type { Role } from "../modules/auth/auth.types";

// Tell Hapi what the "access-cookie" scheme below puts in request.auth.credentials.
declare module "@hapi/hapi/lib/types/request" {
  interface AuthCredentials<
    AuthUser = UserCredentials,
    AuthApp = AppCredentials,
  > {
    userId: string;
    role: Role;
  }
}

const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || "accessToken";

const unauthorized = (h: ResponseToolkit, message: string) =>
  h
    .response({
      success: false,
      error: { message },
    })
    .code(401)
    .takeover();

export const registerAuthentication = (server: Server): void => {
  server.auth.scheme("access-cookie", () => ({
    authenticate: (request: Request, h: ResponseToolkit) => {
      const token = request.state[ACCESS_COOKIE_NAME] as string | undefined;

      if (!token) {
        return unauthorized(h, "Authentication required");
      }

      try {
        const claims = verifyAccessToken(token);

        return h.authenticated({
          credentials: {
            userId: claims.sub,
            role: claims.role,
          },
        });
      } catch {
        return unauthorized(h, "Invalid or expired access token");
      }
    },
  }));

  server.auth.strategy("access-token", "access-cookie");
};

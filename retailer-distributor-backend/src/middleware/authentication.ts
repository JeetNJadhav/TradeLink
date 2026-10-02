import { Request, ResponseToolkit, Server } from "@hapi/hapi";
import { ACCESS_COOKIE_NAME } from "../config/auth.config";
import type { Role } from "../modules/auth/auth.types";
import type { TokenService } from "../modules/auth/token.service";
import { errorResponse } from "../utils/response";

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

const unauthorized = (h: ResponseToolkit, message: string) =>
  errorResponse(h, message, 401).takeover();

export const registerAuthentication = (
  server: Server,
  tokenService: Pick<TokenService, "verifyAccessToken">,
): void => {
  server.auth.scheme("access-cookie", () => ({
    authenticate: (request: Request, h: ResponseToolkit) => {
      const token = request.state[ACCESS_COOKIE_NAME] as string | undefined;

      if (!token) {
        return unauthorized(h, "Authentication required");
      }

      try {
        const claims = tokenService.verifyAccessToken(token);

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

import { Server } from "@hapi/hapi";
import Joi from "joi";

import {
  createLoginHandler,
  createLogoutHandler,
  createMeHandler,
  createRefreshHandler,
} from "./auth.controller";
import { AuthService } from "./auth.service";
import { ROUTES } from "../../config/routes";

const credentialsSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const registerAuthRoutes = (
  server: Server,
  authService: AuthService,
) => {
  server.route({
    method: "POST",
    path: ROUTES.AUTH.LOGIN,
    options: {
      validate: {
        payload: credentialsSchema,
      },
    },
    handler: createLoginHandler(authService),
  });

  server.route({
    method: "POST",
    path: ROUTES.AUTH.REFRESH,
    handler: createRefreshHandler(authService),
  });

  server.route({
    method: "POST",
    path: ROUTES.AUTH.LOGOUT,
    handler: createLogoutHandler(authService),
  });

  server.route({
    method: "GET",
    path: ROUTES.AUTH.ME,
    options: { auth: "access-token" },
    handler: createMeHandler(authService),
  });
};

import { Server } from "@hapi/hapi";
import Joi from "joi";

import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
} from "./auth.controller";
import { ROUTES } from "../../config/routes";

const credentialsSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const registerAuthRoutes = (server: Server) => {
  server.route({
    method: "POST",
    path: ROUTES.AUTH.LOGIN,
    options: {
      validate: {
        payload: credentialsSchema,
        failAction: (request, h, err) => {
          console.log("VALIDATION ERROR:", err?.message);
          throw err;
        },
      },
    },
    handler: loginHandler,
  });

  server.route({
    method: "POST",
    path: ROUTES.AUTH.REFRESH,
    handler: refreshHandler,
  });

  server.route({
    method: "POST",
    path: ROUTES.AUTH.LOGOUT,
    handler: logoutHandler,
  });

  server.route({
    method: "GET",
    path: ROUTES.AUTH.ME,
    options: { auth: "access-token" },
    handler: meHandler,
  });
};

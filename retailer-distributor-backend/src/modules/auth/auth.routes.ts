import { Server } from "@hapi/hapi";
import Joi from "joi";

import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
} from "./auth.controller";
import { requireAuthentication } from "../../middleware/authentication";
const credentialsSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
export const registerAuthRoutes = (server: Server) => {
  server.route({
    method: "POST",
    path: "/auth/login",
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
    path: "/auth/refresh",
    handler: refreshHandler,
  });
  server.route({
    method: "POST",
    path: "/auth/logout",
    handler: logoutHandler,
  });
  server.route({
    method: "GET",
    path: "/auth/me",
    options: { pre: [{ method: requireAuthentication }] },
    handler: meHandler,
  });
};

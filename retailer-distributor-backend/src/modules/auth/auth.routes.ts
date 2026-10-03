import { Server } from "@hapi/hapi";
import Joi from "joi";

import {
  createChangePasswordHandler,
  createLoginHandler,
  createLogoutHandler,
  createMeHandler,
  createRefreshHandler,
  createRegisterHandler,
} from "./auth.controller";
import { AuthService } from "./auth.service";
import { REGISTRATION_ROLES } from "./auth.types";
import { RegistrationService } from "./registration.service";
import { ROUTES } from "../../config/routes";
import { requireCsrf } from "../../middleware/csrf";
import {
  contactInfoSchema,
  locationSchema,
  nameSchema,
  newPasswordSchema,
  organizationNameSchema,
  phoneSchema,
} from "../../utils/validation";

const credentialsSchema = Joi.object({
  // Any domain may sign in: the seed accounts use a .local address, which the
  // default top-level-domain check rejects. Registration keeps that check.
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(8).required(),
});

const registerSchema = Joi.object({
  role: Joi.string()
    .valid(...REGISTRATION_ROLES)
    .required(),
  name: nameSchema.required(),
  email: Joi.string().trim().email().max(254).required(),
  phone: phoneSchema.required(),
  password: newPasswordSchema.required(),
  organizationName: organizationNameSchema.required(),
  contactInfo: contactInfoSchema,
  location: locationSchema.required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: newPasswordSchema.required(),
});

export const registerAuthRoutes = (
  server: Server,
  authService: AuthService,
  registrationService: RegistrationService,
) => {
  server.route({
    method: "POST",
    path: ROUTES.AUTH.REGISTER,
    options: {
      validate: {
        payload: registerSchema,
      },
    },
    handler: createRegisterHandler(registrationService),
  });

  server.route({
    method: "POST",
    path: ROUTES.AUTH.PASSWORD,
    options: {
      auth: "access-token",
      pre: [{ method: requireCsrf }],
      validate: {
        payload: changePasswordSchema,
      },
    },
    handler: createChangePasswordHandler(authService),
  });

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

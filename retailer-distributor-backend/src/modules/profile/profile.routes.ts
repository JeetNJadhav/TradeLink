import { Server } from "@hapi/hapi";
import Joi from "joi";
import {
  createGetProfileHandler,
  createUpdateProfileHandler,
} from "./profile.controller";
import { ProfileService } from "./profile.service";
import { ROUTES } from "../../config/routes";
import { requireRole } from "../../middleware/authorization";
import { requireCsrf } from "../../middleware/csrf";
import {
  contactInfoSchema,
  locationSchema,
  nameSchema,
  organizationNameSchema,
  phoneSchema,
} from "../../utils/validation";

const updateProfileSchema = Joi.object({
  name: nameSchema.required(),
  phone: phoneSchema.required(),
  organizationName: organizationNameSchema.required(),
  contactInfo: contactInfoSchema,
  location: locationSchema.required(),
});

// Admins have no retailer or distributor profile.
const requireProfileRole = requireRole("RETAILER", "DISTRIBUTOR");

export const registerProfileRoutes = (
  server: Server,
  profileService: ProfileService,
) => {
  server.route({
    method: "GET",
    path: ROUTES.PROFILE.ME,
    options: {
      auth: "access-token",
      pre: [{ method: requireProfileRole }],
    },
    handler: createGetProfileHandler(profileService),
  });

  server.route({
    method: "PUT",
    path: ROUTES.PROFILE.ME,
    options: {
      auth: "access-token",
      pre: [{ method: requireProfileRole }, { method: requireCsrf }],
      validate: {
        payload: updateProfileSchema,
      },
    },
    handler: createUpdateProfileHandler(profileService),
  });
};

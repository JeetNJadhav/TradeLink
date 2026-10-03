import { Server } from "@hapi/hapi";
import {
  addListingHandler,
  listListingsHandler,
  removeListingHandler,
  updateListingHandler,
} from "./distributorListing.controller";
import { DistributorListingService } from "./distributorListing.service";
import {
  addListingSchema,
  distributorProductParamsSchema,
  updateListingSchema,
} from "./distributorProduct.validation";
import { requireRole } from "../../middleware/authorization";
import { requireCsrf } from "../../middleware/csrf";
import { ROUTES } from "../../config/routes";

export const registerDistributorListingRoutes = (
  server: Server,
  distributorListingService: DistributorListingService,
) => {
  server.route({
    method: "GET",
    path: ROUTES.DISTRIBUTOR_LISTINGS.LIST,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }],
    },
    handler: listListingsHandler(distributorListingService),
  });

  server.route({
    method: "POST",
    path: ROUTES.DISTRIBUTOR_LISTINGS.CREATE,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }, { method: requireCsrf }],
      validate: {
        payload: addListingSchema,
      },
    },
    handler: addListingHandler(distributorListingService),
  });

  server.route({
    method: "PATCH",
    path: ROUTES.DISTRIBUTOR_LISTINGS.BY_ID,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }, { method: requireCsrf }],
      validate: {
        params: distributorProductParamsSchema,
        payload: updateListingSchema,
      },
    },
    handler: updateListingHandler(distributorListingService),
  });

  server.route({
    method: "DELETE",
    path: ROUTES.DISTRIBUTOR_LISTINGS.BY_ID,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }, { method: requireCsrf }],
      validate: {
        params: distributorProductParamsSchema,
      },
    },
    handler: removeListingHandler(distributorListingService),
  });
};

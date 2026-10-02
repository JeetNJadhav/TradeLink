import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createGetDistributorProductsHandler } from "./distributor.controller";
import { DistributorService } from "./distributor.service";
import { ROUTES } from "../../config/routes";

const distributorParamsSchema = Joi.object({
  distributorId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const registerDistributorRoutes = (
  server: Server,
  distributorService: DistributorService,
) => {
  server.route({
    method: "GET",
    path: ROUTES.DISTRIBUTORS.PRODUCTS,
    options: {
      auth: "access-token",
      validate: {
        params: distributorParamsSchema,
      },
    },
    handler: createGetDistributorProductsHandler(distributorService),
  });
};

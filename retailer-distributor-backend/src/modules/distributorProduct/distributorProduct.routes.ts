import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createGetDistributorProductByIdHandler } from "./distributorProduct.controller";
import { DistributorProductService } from "./distributorProduct.service";
import { ROUTES } from "../../config/routes";

const distributorProductParamsSchema = Joi.object({
  distributorProductId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const registerDistributorProductRoutes = (
  server: Server,
  distributorProductService: DistributorProductService,
) => {
  server.route({
    method: "GET",
    path: ROUTES.DISTRIBUTOR_PRODUCTS.BY_ID,
    options: {
      auth: "access-token",
      validate: {
        params: distributorProductParamsSchema,
      },
    },
    handler: createGetDistributorProductByIdHandler(distributorProductService),
  });
};

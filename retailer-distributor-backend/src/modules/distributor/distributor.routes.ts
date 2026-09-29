import { Server } from "@hapi/hapi";
import Joi from "joi";
import {
  createGetDistributorProductByIdHandler,
  createGetDistributorProductsHandler,
} from "./distributor.controller";
import { requireAuthentication } from "../../middleware/authentication";
import { DistributorService } from "./distributor.service";

const distributorProductParamsSchema = Joi.object({
  distributorProductId: Joi.string().guid({ version: "uuidv4" }).required(),
});

const distributorParamsSchema = Joi.object({
  distributorId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const registerDistributorRoutes = (
  server: Server,
  distributorService: DistributorService,
) => {
  server.route({
    method: "GET",
    path: "/distributor-products/{distributorProductId}",
    options: {
      pre: [{ method: requireAuthentication }],
      validate: {
        params: distributorProductParamsSchema,
      },
    },
    handler: createGetDistributorProductByIdHandler(distributorService),
  });

  server.route({
    method: "GET",
    path: "/distributors/{distributorId}/products",
    options: {
      pre: [{ method: requireAuthentication }],
      validate: {
        params: distributorParamsSchema,
      },
    },
    handler: createGetDistributorProductsHandler(distributorService),
  });
};

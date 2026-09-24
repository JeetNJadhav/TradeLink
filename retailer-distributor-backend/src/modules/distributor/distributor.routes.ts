import { Server } from "@hapi/hapi";
import Joi from "joi";
import {
  getDistributorProductByIdHandler,
  getDistributorProductsHandler,
} from "./distributor.controller";
import { requireAuthentication } from "../../middleware/authentication";

const distributorProductParamsSchema = Joi.object({
  distributorProductId: Joi.string().guid({ version: "uuidv4" }).required(),
});

const distributorParamsSchema = Joi.object({
  distributorId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const registerDistributorRoutes = (server: Server) => {
  server.route({
    method: "GET",
    path: "/distributor-products/{distributorProductId}",
    options: {
      pre: [{ method: requireAuthentication }],
      validate: { params: distributorProductParamsSchema },
    },
    handler: getDistributorProductByIdHandler,
  });

  server.route({
    method: "GET",
    path: "/distributors/{distributorId}/products",
    options: {
      pre: [{ method: requireAuthentication }],
      validate: { params: distributorParamsSchema },
    },
    handler: getDistributorProductsHandler,
  });
};

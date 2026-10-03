import { Server } from "@hapi/hapi";
import { createGetDistributorProductByIdHandler } from "./distributorProduct.controller";
import { DistributorProductService } from "./distributorProduct.service";
import { distributorProductParamsSchema } from "./distributorProduct.validation";
import { ROUTES } from "../../config/routes";

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

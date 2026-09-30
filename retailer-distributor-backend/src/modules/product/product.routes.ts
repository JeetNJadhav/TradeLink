import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createProductDistributorsHandler } from "./product.controller";
import { ProductService } from "./product.service";
import { ROUTES } from "../../config/routes";

const productIdParamsSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const registerProductRoutes = (
  server: Server,
  productService: ProductService,
) => {
  server.route([
    {
      method: "GET",
      path: ROUTES.PRODUCTS.DISTRIBUTORS,
      options: {
        auth: "access-token",
        validate: { params: productIdParamsSchema },
      },
      handler: createProductDistributorsHandler(productService),
    },
  ]);
};

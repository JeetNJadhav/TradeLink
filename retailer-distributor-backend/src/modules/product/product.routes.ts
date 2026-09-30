import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createProductDistributorsHandler } from "./product.controller";
import { ProductService } from "./product.service";

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
      path: "/products/{id}/distributors",
      options: {
        auth: "access-token",
        validate: { params: productIdParamsSchema },
      },
      handler: createProductDistributorsHandler(productService),
    },
  ]);
};

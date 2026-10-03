import { Server } from "@hapi/hapi";
import Joi from "joi";
import {
  createCatalogProductsHandler,
  createProductDistributorsHandler,
} from "./product.controller";
import { ProductService } from "./product.service";
import { requireRole } from "../../middleware/authorization";
import { ROUTES } from "../../config/routes";

const productIdParamsSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

const catalogQuerySchema = Joi.object({
  q: Joi.string().trim().max(100).allow(""),
  limit: Joi.number().integer().min(1).max(50).default(20),
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
    {
      method: "GET",
      path: ROUTES.CATALOG.PRODUCTS,
      options: {
        auth: "access-token",
        pre: [{ method: requireRole("DISTRIBUTOR") }],
        validate: { query: catalogQuerySchema },
      },
      handler: createCatalogProductsHandler(productService),
    },
  ]);
};

import { Server } from "@hapi/hapi";
import Joi from "joi";
import {
  createSearchProductsHandler,
  createProductDistributorsHandler,
  createProductSuggestions,
} from "./product.controller";
import { requireAuthentication } from "../../middleware/authentication";
import { SearchService } from "../search/search.service";
import { ProductService } from "./product.service";

const searchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  sortBy: Joi.string().valid("relevance", "nearest").optional(),
});

const suggestionsQuerySchema = Joi.object({
  q: Joi.string().trim().allow("").optional(),
});

const productIdParamsSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const registerProductRoutes = (
  server: Server,
  searchService: SearchService,
  productService: ProductService,
) => {
  server.route([
    {
      method: "GET",
      path: "/products/suggestions",
      options: {
        pre: [{ method: requireAuthentication }],
        validate: { query: suggestionsQuerySchema },
      },
      handler: createProductSuggestions(searchService),
    },
    {
      method: "GET",
      path: "/products/{id}/distributors",
      options: {
        pre: [{ method: requireAuthentication }],
        validate: { params: productIdParamsSchema },
      },
      handler: createProductDistributorsHandler(productService),
    },
    {
      method: "GET",
      path: "/products/search",
      options: {
        pre: [{ method: requireAuthentication }],
        validate: { query: searchQuerySchema },
      },
      handler: createSearchProductsHandler(searchService),
    },
  ]);
};

// Request
//    ↓
// Hapi validation
//    ↓
// Controller
//    ↓
// Service
//    ↓
// Prisma

import { Server } from "@hapi/hapi";
import Joi from "joi";
import {
  getProductDistributorsHandler,
  getProductSuggestions,
  searchProducts,
} from "./product.controller";
import { requireAuthentication } from "../../middleware/authentication";

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

export const registerProductRoutes = (server: Server) => {
  server.route([
    {
      method: "GET",
      path: "/products/suggestions",
      options: {
        pre: [{ method: requireAuthentication }],
        validate: { query: suggestionsQuerySchema },
      },
      handler: getProductSuggestions,
    },
    {
      method: "GET",
      path: "/products/{id}/distributors",
      options: {
        pre: [{ method: requireAuthentication }],
        validate: { params: productIdParamsSchema },
      },
      handler: getProductDistributorsHandler,
    },
    {
      method: "GET",
      path: "/products/search",
      options: {
        pre: [{ method: requireAuthentication }],
        validate: { query: searchQuerySchema },
      },
      handler: searchProducts,
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

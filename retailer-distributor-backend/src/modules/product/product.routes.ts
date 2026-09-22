import { Server } from "@hapi/hapi";
import {
  getProductDistributorsHandler,
  getProductSuggestions,
  searchProducts,
} from "./product.controller";

export const registerProductRoutes = (server: Server) => {
  server.route([
    {
      method: "GET",
      path: "/products/suggestions",
      handler: getProductSuggestions,
    },
    {
      method: "GET",
      path: "/products/{id}/distributors",
      handler: getProductDistributorsHandler,
    },
    {
      method: "GET",
      path: "/products/search",
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

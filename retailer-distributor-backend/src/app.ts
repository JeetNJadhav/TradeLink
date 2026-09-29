import Hapi from "@hapi/hapi";
import "dotenv/config";
import { registerProductRoutes } from "./modules/product/product.routes";
import { errorHandler } from "./middleware/error-handler";
import { registerDistributorRoutes } from "./modules/distributor/distributor.routes";
import { registerOrderRoutes } from "./modules/order/order.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";

import { SearchService } from "./modules/search/search.service";
import { OpenSearchRepository } from "./infrastructure/opensearch/repositories/opensearch.repository";
import { PrismaDistributorProductRepository } from "./infrastructure/prisma/repositories/distributorProduct.repository";

import { ProductService } from "./modules/product/product.service";
import { prisma } from "./infrastructure/prisma/prisma.client";

const createApp = async (): Promise<Hapi.Server> => {
  const searchRepository = new OpenSearchRepository();
  const searchService = new SearchService(searchRepository);
  const productRepository = new PrismaDistributorProductRepository(prisma);
  const productService = new ProductService(productRepository);

  const server = Hapi.server({
    port: 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
        additionalHeaders: ["X-CSRF-Token"],
      },
    },
  });

  server.ext("onPreResponse", (req, h) => {
    const resp = req.response;
    if (resp instanceof Error) {
      return errorHandler(req, h, resp);
    }

    return h.continue;
  });

  server.route({
    method: "GET",
    path: "/health",
    handler: () => {
      return {
        status: "ok",
      };
    },
  });

  registerAuthRoutes(server);
  registerProductRoutes(server, searchService, productService);
  registerDistributorRoutes(server);
  registerOrderRoutes(server);

  return server;
};

export default createApp;

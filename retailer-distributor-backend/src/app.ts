import Hapi from "@hapi/hapi";
import "dotenv/config";
import { registerProductRoutes } from "./modules/product/product.routes";
import { errorHandler } from "./middleware/error-handler";
import { registerDistributorRoutes } from "./modules/distributor/distributor.routes";
import { registerOrderRoutes } from "./modules/order/order.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";

import { SearchService } from "./modules/search/search.service";
import { OpenSearchRepository } from "./infrastructure/opensearch/repositories/opensearch.repository";
import { PrismaDistributorProductRepository } from "./infrastructure/prisma/repositories/distributorProduct.repository.prisma";

import { ProductService } from "./modules/product/product.service";
import { prisma } from "./infrastructure/prisma/prisma.client";
import { PrismaDistributorRepository } from "./infrastructure/prisma/repositories/distributor.repository.prisma";
import { createDistributorService } from "./modules/distributor/distributor.service";

import { registerAuthentication } from "./middleware/authentication";
import { registerSearchRoutes } from "./modules/search/search.routes";

const createApp = async (): Promise<Hapi.Server> => {
  // search
  const searchRepository = new OpenSearchRepository();
  const searchService = new SearchService(searchRepository);

  // product
  const productRepository = new PrismaDistributorProductRepository(prisma);
  const productService = new ProductService(productRepository);

  // distributor
  // Using functional DI here to compare it with the class-based approach used by other services.
  const distributorRepository = new PrismaDistributorRepository();
  const distributorService = createDistributorService(distributorRepository);

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

  registerAuthentication(server);

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
  registerSearchRoutes(server, searchService);
  registerProductRoutes(server, productService);
  registerDistributorRoutes(server, distributorService);
  registerOrderRoutes(server);

  return server;
};

export default createApp;

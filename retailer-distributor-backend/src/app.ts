import Hapi from "@hapi/hapi";
import "dotenv/config";
import { registerProductRoutes } from "./modules/product/product.routes";
import { errorHandler } from "./middleware/error-handler";
import { registerDistributorRoutes } from "./modules/distributor/distributor.routes";
import { registerOrderRoutes } from "./modules/order/order.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";

import { SearchService } from "./modules/search/search.service";
import opensearchClient from "./infrastructure/opensearch/openSearch.client";
import { OpenSearchRepository } from "./infrastructure/opensearch/repositories/opensearch.repository";
import { PrismaDistributorProductRepository } from "./infrastructure/prisma/repositories/distributorProduct.repository.prisma";

import { ProductService } from "./modules/product/product.service";
import { prisma } from "./infrastructure/prisma/prisma.client";
import { PrismaDistributorRepository } from "./infrastructure/prisma/repositories/distributor.repository.prisma";
import { createDistributorService } from "./modules/distributor/distributor.service";

import { OrderService } from "./modules/order/order.service";
import { PrismaOrderUnitOfWork } from "./infrastructure/prisma/order.unitOfWork.prisma";

import { AuthService } from "./modules/auth/auth.service";
import { BcryptPasswordHasher } from "./modules/auth/password.service";
import { JwtTokenService } from "./modules/auth/token.service";
import { PrismaAuthRepository } from "./infrastructure/prisma/repositories/auth.repository.prisma";
import {
  ACCESS_TOKEN_TTL,
  getJwtSecret,
  REFRESH_TOKEN_TTL_MS,
} from "./config/auth.config";

import { registerAuthentication } from "./middleware/authentication";
import { registerSearchRoutes } from "./modules/search/search.routes";
import { ROUTES } from "./config/routes";

const createApp = async (): Promise<Hapi.Server> => {
  // auth
  const tokenService = new JwtTokenService({
    accessTokenTtl: ACCESS_TOKEN_TTL,
    refreshTokenTtlMs: REFRESH_TOKEN_TTL_MS,
    getSecret: getJwtSecret,
  });
  const authService = new AuthService(
    new PrismaAuthRepository(prisma),
    new BcryptPasswordHasher(),
    tokenService,
  );

  // search
  const searchRepository = new OpenSearchRepository(opensearchClient);
  const searchService = new SearchService(searchRepository);

  // distributor product (shared by product and distributor modules)
  const distributorProductRepository = new PrismaDistributorProductRepository(
    prisma,
  );

  // product
  const productService = new ProductService(distributorProductRepository);

  // distributor
  // Using functional DI here to compare it with the class-based approach used by other services.
  const distributorRepository = new PrismaDistributorRepository(prisma);
  const distributorService = createDistributorService(
    distributorRepository,
    distributorProductRepository,
  );

  // order
  const orderService = new OrderService(new PrismaOrderUnitOfWork(prisma));

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

  registerAuthentication(server, tokenService);

  server.ext("onPreResponse", (req, h) => {
    const resp = req.response;
    if (resp instanceof Error) {
      return errorHandler(req, h, resp);
    }

    return h.continue;
  });

  server.route({
    method: "GET",
    path: ROUTES.HEALTH,
    handler: () => {
      return {
        status: "ok",
      };
    },
  });

  registerAuthRoutes(server, authService);
  registerSearchRoutes(server, searchService);
  registerProductRoutes(server, productService);
  registerDistributorRoutes(server, distributorService);
  registerOrderRoutes(server, orderService);

  return server;
};

export default createApp;

import Hapi from "@hapi/hapi";
import { env } from "./config/env";
import { registerProductRoutes } from "./modules/product/product.routes";
import { errorHandler } from "./middleware/error-handler";
import { registerDistributorRoutes } from "./modules/distributor/distributor.routes";
import { registerOrderRoutes } from "./modules/order/order.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";

import { SearchService } from "./modules/search/search.service";
import opensearchClient from "./infrastructure/opensearch/opensearch.client";
import { OpenSearchRepository } from "./infrastructure/opensearch/repositories/search.repository.opensearch";
import { PrismaDistributorProductRepository } from "./infrastructure/prisma/repositories/distributorProduct.repository.prisma";

import { ProductService } from "./modules/product/product.service";
import { prisma } from "./infrastructure/prisma/prisma.client";
import { createDistributorService } from "./modules/distributor/distributor.service";

import { DistributorProductService } from "./modules/distributorProduct/distributorProduct.service";
import { registerDistributorProductRoutes } from "./modules/distributorProduct/distributorProduct.routes";

import { OrderService } from "./modules/order/order.service";
import { DistributorOrderService } from "./modules/order/distributorOrder.service";
import { registerDistributorOrderRoutes } from "./modules/order/distributorOrder.routes";
import { RetailerOrderService } from "./modules/order/retailerOrder.service";
import { registerRetailerOrderRoutes } from "./modules/order/retailerOrder.routes";
import { PrismaOrderUnitOfWork } from "./infrastructure/prisma/order.unitOfWork.prisma";

import { AuthService } from "./modules/auth/auth.service";
import { RegistrationService } from "./modules/auth/registration.service";
import { SessionService } from "./modules/auth/session.service";
import { BcryptPasswordHasher } from "./infrastructure/security/password.service.bcrypt";
import { JwtTokenService } from "./infrastructure/security/token.service.jwt";
import { PrismaAuthRepository } from "./infrastructure/prisma/repositories/auth.repository.prisma";
import {
  ACCESS_TOKEN_TTL,
  CSRF_HEADER_NAME,
  getJwtSecret,
  REFRESH_TOKEN_TTL_MS,
} from "./config/auth.config";

import { ProfileService } from "./modules/profile/profile.service";
import { registerProfileRoutes } from "./modules/profile/profile.routes";
import { PrismaProfileRepository } from "./infrastructure/prisma/repositories/profile.repository.prisma";

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
  const authRepository = new PrismaAuthRepository(prisma);
  const passwordHasher = new BcryptPasswordHasher();
  const authService = new AuthService(
    authRepository,
    passwordHasher,
    new SessionService(authRepository, authRepository, tokenService),
  );
  const registrationService = new RegistrationService(
    authRepository,
    passwordHasher,
  );

  // profile
  const profileService = new ProfileService(
    new PrismaProfileRepository(prisma),
  );

  // search
  const searchRepository = new OpenSearchRepository(opensearchClient);
  const searchService = new SearchService(searchRepository);

  // distributor product (its repository is also used by the product and distributor modules)
  const distributorProductRepository = new PrismaDistributorProductRepository(
    prisma,
  );
  const distributorProductService = new DistributorProductService(
    distributorProductRepository,
  );

  // product
  const productService = new ProductService(distributorProductRepository);

  // distributor
  // Using functional DI here to compare it with the class-based approach used by other services.
  const distributorService = createDistributorService(
    distributorProductRepository,
  );

  // order (the search repository keeps the stock in the index current)
  const orderUnitOfWork = new PrismaOrderUnitOfWork(prisma);
  const orderService = new OrderService(orderUnitOfWork, searchRepository);
  const distributorOrderService = new DistributorOrderService(
    orderUnitOfWork,
    searchRepository,
  );
  const retailerOrderService = new RetailerOrderService(orderUnitOfWork);

  const server = Hapi.server({
    port: env.PORT,
    host: env.HOST,
    routes: {
      cors: {
        origin: [env.CORS_ORIGIN],
        credentials: true,
        additionalHeaders: [CSRF_HEADER_NAME],
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

  registerAuthRoutes(server, authService, registrationService);
  registerProfileRoutes(server, profileService);
  registerSearchRoutes(server, searchService);
  registerProductRoutes(server, productService);
  registerDistributorRoutes(server, distributorService);
  registerDistributorProductRoutes(server, distributorProductService);
  registerOrderRoutes(server, orderService);
  registerRetailerOrderRoutes(server, retailerOrderService);
  registerDistributorOrderRoutes(server, distributorOrderService);

  return server;
};

export default createApp;

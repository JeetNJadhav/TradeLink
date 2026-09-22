import { Server } from "@hapi/hapi";
import {
  getDistributorByIdHandler,
  getDistributorProductByIdHandler,
  getDistributorProductsHandler,
  getDistributorsHandler,
} from "./distributor.controller";

export const registerDistributorRoutes = (server: Server) => {
  // server.route({
  //   method: "GET",
  //   path: "/distributors",
  //   handler: getDistributorsHandler,
  // });

  server.route({
    method: "GET",
    path: "/distributor-products/{distributorProductId}",
    handler: getDistributorProductByIdHandler,
  });

  // server.route({
  //   method: "GET",
  //   path: "/distributors/{distributorId}", // check this
  //   handler: getDistributorByIdHandler,
  // });

  server.route({
    method: "GET",
    path: "/distributors/{distributorId}/products",
    handler: getDistributorProductsHandler,
  });
};

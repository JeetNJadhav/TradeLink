import { Server } from "@hapi/hapi";
import {
  getDistributorByIdHandler,
  getDistributorProductsHandler,
  getDistributorsHandler,
} from "./distributor.controller";

export const registerDistributorRoutes = (server: Server) => {
  server.route({
    method: "GET",
    path: "/distributors",
    handler: getDistributorsHandler,
  });

  server.route({
    method: "GET",
    path: "/distributors/{id}",
    handler: getDistributorByIdHandler,
  });

  server.route({
    method: "GET",
    path: "/distributors/{id}/products",
    handler: getDistributorProductsHandler,
  });
};

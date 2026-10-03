import { Server } from "@hapi/hapi";
import {
  getRetailerOrderHandler,
  listRetailerOrdersHandler,
} from "./retailerOrder.controller";
import { RetailerOrderService } from "./retailerOrder.service";
import { listOrdersQuerySchema, orderParamsSchema } from "./order.validation";
import { requireRole } from "../../middleware/authorization";
import { ROUTES } from "../../config/routes";

export const registerRetailerOrderRoutes = (
  server: Server,
  retailerOrderService: RetailerOrderService,
) => {
  server.route({
    method: "GET",
    path: ROUTES.ORDERS.LIST,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("RETAILER") }],
      validate: {
        query: listOrdersQuerySchema,
      },
    },
    handler: listRetailerOrdersHandler(retailerOrderService),
  });

  server.route({
    method: "GET",
    path: ROUTES.ORDERS.BY_ID,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("RETAILER") }],
      validate: {
        params: orderParamsSchema,
      },
    },
    handler: getRetailerOrderHandler(retailerOrderService),
  });
};

import { Server } from "@hapi/hapi";
import Joi from "joi";
import {
  acceptOrderHandler,
  getDistributorOrderHandler,
  listDistributorOrdersHandler,
  rejectOrderHandler,
} from "./distributorOrder.controller";
import { DistributorOrderService } from "./distributorOrder.service";
import { listOrdersQuerySchema, orderParamsSchema } from "./order.validation";
import { requireRole } from "../../middleware/authorization";
import { requireCsrf } from "../../middleware/csrf";
import { ROUTES } from "../../config/routes";

const rejectOrderSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(500).required(),
});

export const registerDistributorOrderRoutes = (
  server: Server,
  distributorOrderService: DistributorOrderService,
) => {
  server.route({
    method: "GET",
    path: ROUTES.DISTRIBUTOR_ORDERS.LIST,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }],
      validate: {
        query: listOrdersQuerySchema,
      },
    },
    handler: listDistributorOrdersHandler(distributorOrderService),
  });

  server.route({
    method: "GET",
    path: ROUTES.DISTRIBUTOR_ORDERS.BY_ID,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }],
      validate: {
        params: orderParamsSchema,
      },
    },
    handler: getDistributorOrderHandler(distributorOrderService),
  });

  server.route({
    method: "POST",
    path: ROUTES.DISTRIBUTOR_ORDERS.ACCEPT,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }, { method: requireCsrf }],
      validate: {
        params: orderParamsSchema,
      },
    },
    handler: acceptOrderHandler(distributorOrderService),
  });

  server.route({
    method: "POST",
    path: ROUTES.DISTRIBUTOR_ORDERS.REJECT,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("DISTRIBUTOR") }, { method: requireCsrf }],
      validate: {
        params: orderParamsSchema,
        payload: rejectOrderSchema,
      },
    },
    handler: rejectOrderHandler(distributorOrderService),
  });
};

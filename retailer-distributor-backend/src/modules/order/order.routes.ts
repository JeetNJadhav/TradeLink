import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createOrderHandler } from "./order.controller";
import { OrderService } from "./order.service";
import { requireRole } from "../../middleware/authorization";
import { requireCsrf } from "../../middleware/csrf";
import { ROUTES } from "../../config/routes";

const createOrderSchema = Joi.object({
  distributorId: Joi.string().guid({ version: "uuidv4" }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().guid({ version: "uuidv4" }).required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required(),
});

export const registerOrderRoutes = (
  server: Server,
  orderService: OrderService,
) => {
  server.route({
    method: "POST",
    path: ROUTES.ORDERS.CREATE,
    options: {
      auth: "access-token",
      pre: [{ method: requireRole("RETAILER") }, { method: requireCsrf }],
      validate: {
        payload: createOrderSchema,
      },
    },
    handler: createOrderHandler(orderService),
  });
};

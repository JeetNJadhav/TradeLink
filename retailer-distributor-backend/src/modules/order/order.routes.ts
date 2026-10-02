import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createOrderHandler } from "./order.controller";
import { OrderService } from "./order.service";
import { requireRole } from "../../middleware/authorization";
import { requireCsrf } from "../../middleware/csrf";
import { ROUTES } from "../../config/routes";

// Upper bounds keep a request inside what the database columns and one
// transaction can hold.
const MAX_ORDER_ITEMS = 100;
const MAX_ITEM_QUANTITY = 1_000_000;

const createOrderSchema = Joi.object({
  distributorId: Joi.string().guid({ version: "uuidv4" }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().guid({ version: "uuidv4" }).required(),
        quantity: Joi.number()
          .integer()
          .positive()
          .max(MAX_ITEM_QUANTITY)
          .required(),
      }),
    )
    .min(1)
    .max(MAX_ORDER_ITEMS)
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

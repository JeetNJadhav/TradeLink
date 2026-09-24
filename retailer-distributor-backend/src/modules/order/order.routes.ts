import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createOrderHandler } from "./order.controller";
import { requireAuthentication } from "../../middleware/authentication";
import { requireRole } from "../../middleware/authorization";
import { requireCsrf } from "../../middleware/csrf";

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

export const registerOrderRoutes = (server: Server) => {
  server.route({
    method: "POST",
    path: "/orders",
    options: {
      pre: [
        { method: requireAuthentication },
        { method: requireRole("RETAILER") },
        { method: requireCsrf },
      ],
      validate: {
        payload: createOrderSchema,
      },
    },
    handler: createOrderHandler,
  });
};

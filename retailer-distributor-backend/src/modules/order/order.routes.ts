import { Server } from "@hapi/hapi";
import Joi from "joi";
import { createOrderHandler } from "./order.controller";

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
      validate: {
        payload: createOrderSchema,
      },
    },
    handler: createOrderHandler,
  });
};

import Joi from "joi";
import { ORDER_STATUSES } from "./order.transitions";

// Shared by the retailer and distributor order routes.
export const orderParamsSchema = Joi.object({
  orderId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const listOrdersQuerySchema = Joi.object({
  status: Joi.string().valid(...ORDER_STATUSES),
});

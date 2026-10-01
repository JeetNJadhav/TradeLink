import { Request, ResponseToolkit } from "@hapi/hapi";
import { OrderService } from "./order.service";
import type { CreateOrderInput } from "./order.types";
import { successResponse } from "../../utils/response";

export const createOrderHandler =
  (orderService: OrderService) =>
  async (request: Request, h: ResponseToolkit) => {
    const input = request.payload as CreateOrderInput;
    const { userId } = request.auth.credentials;
    const order = await orderService.createOrder(userId, input);

    return successResponse(h, { order }, 201);
  };

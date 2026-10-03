import { Request, ResponseToolkit } from "@hapi/hapi";
import { RetailerOrderService } from "./retailerOrder.service";
import type { OrderStatus } from "./order.types";
import { successResponse } from "../../utils/response";

export const listRetailerOrdersHandler =
  (service: RetailerOrderService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { status } = request.query as { status?: OrderStatus };
    const { userId } = request.auth.credentials;
    const orders = await service.listOrders(userId, status);

    return successResponse(h, { orders });
  };

export const getRetailerOrderHandler =
  (service: RetailerOrderService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { orderId } = request.params as { orderId: string };
    const { userId } = request.auth.credentials;
    const order = await service.getOrder(userId, orderId);

    return successResponse(h, { order });
  };

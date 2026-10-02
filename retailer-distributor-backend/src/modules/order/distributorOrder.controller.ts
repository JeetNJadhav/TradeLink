import { Request, ResponseToolkit } from "@hapi/hapi";
import { DistributorOrderService } from "./distributorOrder.service";
import type { OrderStatus, RejectOrderInput } from "./order.types";
import { successResponse } from "../../utils/response";

export const listDistributorOrdersHandler =
  (service: DistributorOrderService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { status } = request.query as { status?: OrderStatus };
    const { userId } = request.auth.credentials;
    const orders = await service.listOrders(userId, status);

    return successResponse(h, { orders });
  };

export const getDistributorOrderHandler =
  (service: DistributorOrderService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { orderId } = request.params as { orderId: string };
    const { userId } = request.auth.credentials;
    const order = await service.getOrder(userId, orderId);

    return successResponse(h, { order });
  };

export const acceptOrderHandler =
  (service: DistributorOrderService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { orderId } = request.params as { orderId: string };
    const { userId } = request.auth.credentials;
    const order = await service.acceptOrder(userId, orderId);

    return successResponse(h, { order });
  };

export const rejectOrderHandler =
  (service: DistributorOrderService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { orderId } = request.params as { orderId: string };
    const { reason } = request.payload as RejectOrderInput;
    const { userId } = request.auth.credentials;
    const order = await service.rejectOrder(userId, orderId, reason);

    return successResponse(h, { order });
  };

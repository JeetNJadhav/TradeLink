import {
  ACCEPT_ORDER_API,
  DISTRIBUTOR_ORDER_API,
  DISTRIBUTOR_ORDERS_API,
  REJECT_ORDER_API,
} from "../../../../shared/api/api";
import apiClient from "../../../../shared/api/apiClient";
import type {
  DistributorOrderDetails,
  DistributorOrderResponse,
  DistributorOrderSummary,
  DistributorOrdersResponse,
  OrderStatus,
} from "../types/order";

// Without a status, every order the distributor received.
export const getDistributorOrders = async (
  status?: OrderStatus,
  signal?: AbortSignal,
): Promise<DistributorOrderSummary[]> => {
  const response = await apiClient.get<DistributorOrdersResponse>(
    DISTRIBUTOR_ORDERS_API,
    { params: { status }, signal },
  );
  return response.data.data.orders;
};

export const getDistributorOrder = async (
  id: string,
  signal?: AbortSignal,
): Promise<DistributorOrderDetails> => {
  const response = await apiClient.get<DistributorOrderResponse>(
    DISTRIBUTOR_ORDER_API(id),
    { signal },
  );
  return response.data.data.order;
};

export const acceptOrder = async (
  id: string,
): Promise<DistributorOrderDetails> => {
  const response = await apiClient.post<DistributorOrderResponse>(
    ACCEPT_ORDER_API(id),
  );
  return response.data.data.order;
};

export const rejectOrder = async (
  id: string,
  reason: string,
): Promise<DistributorOrderDetails> => {
  const response = await apiClient.post<DistributorOrderResponse>(
    REJECT_ORDER_API(id),
    { reason },
  );
  return response.data.data.order;
};

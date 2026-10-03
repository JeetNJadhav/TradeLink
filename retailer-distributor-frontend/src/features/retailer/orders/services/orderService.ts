import {
  CREATE_ORDER_API,
  ORDER_API,
  ORDERS_API,
} from "../../../../shared/api/api";
import apiClient from "../../../../shared/api/apiClient";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderStatus,
  PlacedOrder,
  RetailerOrderDetails,
  RetailerOrderResponse,
  RetailerOrderSummary,
  RetailerOrdersResponse,
} from "../types/order";

export const createOrder = async (
  payload: CreateOrderRequest,
): Promise<PlacedOrder> => {
  const response = await apiClient.post<CreateOrderResponse>(
    CREATE_ORDER_API,
    payload,
  );
  return response.data.data;
};

// Without a status, every order the retailer placed.
export const getRetailerOrders = async (
  status?: OrderStatus,
  signal?: AbortSignal,
): Promise<RetailerOrderSummary[]> => {
  const response = await apiClient.get<RetailerOrdersResponse>(ORDERS_API, {
    params: { status },
    signal,
  });
  return response.data.data.orders;
};

export const getRetailerOrder = async (
  id: string,
  signal?: AbortSignal,
): Promise<RetailerOrderDetails> => {
  const response = await apiClient.get<RetailerOrderResponse>(ORDER_API(id), {
    signal,
  });
  return response.data.data.order;
};

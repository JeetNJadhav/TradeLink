import { CREATE_ORDER_API } from "../../../shared/api/api";
import apiClient from "../../../shared/api/apiClient";
import type { CreateOrderRequest } from "../types/order";

export const createOrder = async (payload: CreateOrderRequest) => {
  const response = await apiClient.post(CREATE_ORDER_API, payload);
  return response.data;
};

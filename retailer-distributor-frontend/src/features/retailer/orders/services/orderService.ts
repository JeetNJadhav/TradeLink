import { CREATE_ORDER_API } from "../../../../shared/api/api";
import apiClient from "../../../../shared/api/apiClient";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  PlacedOrder,
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

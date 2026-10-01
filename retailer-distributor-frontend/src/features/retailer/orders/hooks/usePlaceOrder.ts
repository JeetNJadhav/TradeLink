import { useCallback, useState } from "react";
import { toApiError } from "../../../../shared/api/ApiError";
import { createOrder } from "../services/orderService";
import type { CreateOrderRequest, Order, PlacedOrder } from "../types/order";

interface PlaceOrderState {
  placing: boolean;
  order: Order | null;
  error: string;
}

const IDLE: PlaceOrderState = { placing: false, order: null, error: "" };

const usePlaceOrder = () => {
  const [state, setState] = useState<PlaceOrderState>(IDLE);

  // Resolves to the created order and the stock it left, or null when the
  // request failed.
  const placeOrder = useCallback(
    async (request: CreateOrderRequest): Promise<PlacedOrder | null> => {
      setState({ placing: true, order: null, error: "" });

      try {
        const placed = await createOrder(request);
        setState({ placing: false, order: placed.order, error: "" });
        return placed;
      } catch (error) {
        setState({
          placing: false,
          order: null,
          error: toApiError(error).message,
        });
        return null;
      }
    },
    [],
  );

  return { ...state, placeOrder };
};

export default usePlaceOrder;

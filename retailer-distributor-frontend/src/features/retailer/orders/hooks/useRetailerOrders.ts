import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { getRetailerOrders } from "../services/orderService";
import type { OrderStatus } from "../types/order";

// The signed-in retailer's orders, optionally only those in one status.
const useRetailerOrders = (status?: OrderStatus) => {
  const loadOrders = useCallback(
    (signal: AbortSignal) => getRetailerOrders(status, signal),
    [status],
  );

  const { data, loading, error } = useAsync(loadOrders);

  return { orders: data ?? [], loading, error };
};

export default useRetailerOrders;

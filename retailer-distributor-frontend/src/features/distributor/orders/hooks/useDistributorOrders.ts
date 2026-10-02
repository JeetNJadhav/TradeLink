import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { getDistributorOrders } from "../services/distributorOrderService";
import type { OrderStatus } from "../types/order";

// The signed-in distributor's orders, optionally only those in one status.
const useDistributorOrders = (status?: OrderStatus) => {
  const loadOrders = useCallback(
    (signal: AbortSignal) => getDistributorOrders(status, signal),
    [status],
  );

  const { data, loading, error } = useAsync(loadOrders);

  return { orders: data ?? [], loading, error };
};

export default useDistributorOrders;

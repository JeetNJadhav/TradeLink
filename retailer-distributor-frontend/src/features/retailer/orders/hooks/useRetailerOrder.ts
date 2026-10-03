import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { getRetailerOrder } from "../services/orderService";

// One placed order with its items.
const useRetailerOrder = (id: string | undefined) => {
  const loadOrder = useCallback(
    (signal: AbortSignal) => getRetailerOrder(id ?? "", signal),
    [id],
  );

  const { data, loading, error } = useAsync(id ? loadOrder : null);

  return { order: data, loading, error };
};

export default useRetailerOrder;

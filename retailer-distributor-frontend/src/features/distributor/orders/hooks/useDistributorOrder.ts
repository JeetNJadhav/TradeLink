import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { getDistributorOrder } from "../services/distributorOrderService";

// One received order with its items. `reload` refreshes it after a decision.
const useDistributorOrder = (id: string | undefined) => {
  const loadOrder = useCallback(
    (signal: AbortSignal) => getDistributorOrder(id ?? "", signal),
    [id],
  );

  const { data, loading, error, reload } = useAsync(id ? loadOrder : null);

  return { order: data, loading, error, reload };
};

export default useDistributorOrder;

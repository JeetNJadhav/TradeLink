import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { getDistributorProducts } from "../services/distributorService";

// Everything one distributor sells.
const useDistributorProducts = (distributorId: string | undefined) => {
  const loadProducts = useCallback(
    (signal: AbortSignal) => getDistributorProducts(distributorId ?? "", signal),
    [distributorId],
  );

  const { data, loading, error } = useAsync(
    distributorId ? loadProducts : null,
  );

  return { products: data ?? [], loading, error };
};

export default useDistributorProducts;

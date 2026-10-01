import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { getDistributorProductById } from "../services/distributorService";

// One distributor listing with its product and distributor. `product` is null
// while loading and when the listing does not exist.
const useDistributorProduct = (id: string | undefined) => {
  const loadProduct = useCallback(
    (signal: AbortSignal) => getDistributorProductById(id ?? "", signal),
    [id],
  );

  const { data, loading, error } = useAsync(id ? loadProduct : null);

  return { product: data, loading, error };
};

export default useDistributorProduct;

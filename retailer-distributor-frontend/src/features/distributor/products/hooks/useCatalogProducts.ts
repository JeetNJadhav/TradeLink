import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { searchCatalogProducts } from "../services/listingService";

export const MIN_CATALOG_QUERY_LENGTH = 2;

// Master products matching the search text. Idle until the text is long enough.
const useCatalogProducts = (search: string) => {
  const query = search.trim();
  const enabled = query.length >= MIN_CATALOG_QUERY_LENGTH;

  const loadProducts = useCallback(
    (signal: AbortSignal) => searchCatalogProducts(query, signal),
    [query],
  );

  const { data, loading, error } = useAsync(enabled ? loadProducts : null);

  return { products: data ?? [], loading, error };
};

export default useCatalogProducts;

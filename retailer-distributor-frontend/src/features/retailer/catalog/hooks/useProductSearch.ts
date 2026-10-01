import { useCallback, useState } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { searchProducts } from "../services/productService";

const useProductSearch = () => {
  // null until the first search is submitted
  const [query, setQuery] = useState<string | null>(null);

  const runSearch = useCallback(
    (signal: AbortSignal) => searchProducts({ query: query ?? "" }, signal),
    [query],
  );

  const { data, loading, error, reload } = useAsync(
    query === null ? null : runSearch,
  );

  const search = useCallback(
    (nextQuery: string) => {
      const trimmed = nextQuery.trim();
      if (!trimmed) return;

      setQuery(trimmed);
      // Searching the same text again still fetches fresh results.
      reload();
    },
    [reload],
  );

  return {
    products: data ?? [],
    loading,
    error: error?.message ?? "",
    hasSearched: query !== null,
    search,
  };
};

export default useProductSearch;

import { useCallback } from "react";
import { useAsync } from "../../../../shared/hooks/useAsync";
import { getProductSuggestions } from "../services/productService";

// Must match the minimum the backend answers suggestions for.
export const MIN_SUGGESTION_LENGTH = 3;

const useProductSuggestions = (search: string) => {
  const query = search.trim();
  const enabled = query.length >= MIN_SUGGESTION_LENGTH;

  const loadSuggestions = useCallback(
    (signal: AbortSignal) => getProductSuggestions(query, signal),
    [query],
  );

  const { data, loading } = useAsync(enabled ? loadSuggestions : null);

  return { suggestions: data ?? [], loading };
};

export default useProductSuggestions;

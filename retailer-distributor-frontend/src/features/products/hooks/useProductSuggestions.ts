import { useEffect, useState } from "react";

import type { ProductSuggestion } from "../types/productSearch";
import { getProductSuggestions } from "../services/productService";

const MIN_SEARCH_LENGTH = 3;

const useProductSuggestions = (search: string) => {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = search.trim();

    if (query.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    try {
      setLoading(true);
      const getSuggestions = async () => {
        const response = await getProductSuggestions(query, controller.signal);
        console.log("FE response", response);

        if (!controller.signal.aborted) {
          setSuggestions(response.data.suggestions);
        }
      };
      getSuggestions();
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to fetch suggestions", error);
        setSuggestions([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [search]);

  return {
    suggestions,
    loading,
  };
};

export default useProductSuggestions;

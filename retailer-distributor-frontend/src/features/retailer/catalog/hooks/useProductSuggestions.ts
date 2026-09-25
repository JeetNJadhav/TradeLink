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
    setLoading(true);

    const loadSuggestions = async () => {
      try {
        const response = await getProductSuggestions(query, controller.signal);
        if (!controller.signal.aborted) setSuggestions(response.data.suggestions);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch suggestions", error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadSuggestions();
    return () => controller.abort();
  }, [search]);

  return { suggestions, loading };
};

export default useProductSuggestions;

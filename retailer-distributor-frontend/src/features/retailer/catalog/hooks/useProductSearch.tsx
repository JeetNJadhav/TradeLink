import { useState } from "react";

import type { ProductSearchResult } from "../types/productSearch";
import { searchProducts } from "../services/productService";

const useProductSearch = () => {
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (query: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await searchProducts({
        query,
      });

      setProducts(response.data.products);
    } catch {
      setError("Failed to search products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    search,
  };
};

export default useProductSearch;

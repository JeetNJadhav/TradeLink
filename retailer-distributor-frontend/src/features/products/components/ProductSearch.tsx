import { useState } from "react";

import type { ProductSuggestion } from "../types/productSearch";
import useProductSuggestions from "../hooks/useProductSuggestions";
import ProductSuggestions from "./ProductSuggestions";
import { useProductSearchDebounce } from "../hooks/useProductSearchDebounce";

interface ProductSearchProps {
  onSearch: (query: string) => void;
}

const ProductSearch = ({ onSearch }: ProductSearchProps) => {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestionDebounce = Number(import.meta.env.VITE_SUGGESTION_DEBOUNCE ?? 300);
  const debouncedValue = useProductSearchDebounce(search, suggestionDebounce);

  const { suggestions, loading: searchingSuggestions } =
    useProductSuggestions(debouncedValue);

  const handleSuggestionClick = (suggestion: ProductSuggestion) => {
    setSearch(suggestion.label);
    setShowSuggestions(false);

    onSearch(suggestion.label);
  };

  return (
    <div className="product-search">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={search}
          placeholder="Search products..."
          onChange={(event) => {
            setSearch(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />

        {showSuggestions && suggestions.length > 0 && (
          <ProductSuggestions
            suggestions={suggestions}
            loading={searchingSuggestions}
            onSelect={handleSuggestionClick}
          />
        )}
      </div>
    </div>
  );
};

export default ProductSearch;

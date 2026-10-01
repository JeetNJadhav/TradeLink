import { type FocusEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { env } from "../../../../shared/config/env";
import type { ProductSuggestion } from "../types/productSearch";
import useProductSuggestions, {
  MIN_SUGGESTION_LENGTH,
} from "../hooks/useProductSuggestions";
import ProductSuggestions from "./ProductSuggestions";
import { useProductSearchDebounce } from "../hooks/useProductSearchDebounce";
import { SUGGESTION_ACTIONS } from "../suggestionActions";

interface ProductSearchProps {
  onSearch: (query: string) => void;
}

const ProductSearch = ({ onSearch }: ProductSearchProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedValue = useProductSearchDebounce(
    search,
    env.suggestionDebounceMs,
  );

  const { suggestions, loading: searchingSuggestions } =
    useProductSuggestions(debouncedValue);

  const canSuggest = search.trim().length >= MIN_SUGGESTION_LENGTH;
  // Until the debounce catches up, the suggestions belong to older text.
  const waitingForDebounce = debouncedValue !== search;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setShowSuggestions(false);
    onSearch(search);
  };

  const handleSuggestionClick = (suggestion: ProductSuggestion) => {
    setShowSuggestions(false);

    SUGGESTION_ACTIONS[suggestion.type](suggestion, {
      search: (query) => {
        setSearch(query);
        onSearch(query);
      },
      navigate,
    });
  };

  // Close when focus leaves the input and its suggestions.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setShowSuggestions(false);
    }
  };

  return (
    <form className="product-search" role="search" onSubmit={handleSubmit}>
      <div className="search-input-wrapper" onBlur={handleBlur}>
        <input
          type="text"
          value={search}
          placeholder="Search products..."
          aria-label="Search products"
          onChange={(event) => {
            setSearch(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowSuggestions(false);
          }}
        />

        {showSuggestions && canSuggest && (
          <ProductSuggestions
            suggestions={suggestions}
            loading={searchingSuggestions || waitingForDebounce}
            onSelect={handleSuggestionClick}
          />
        )}
      </div>

      <button
        className="search-button"
        type="submit"
        disabled={!search.trim()}
      >
        Search
      </button>
    </form>
  );
};

export default ProductSearch;

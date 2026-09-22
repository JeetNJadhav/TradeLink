import type { ProductSuggestion } from "../types/productSearch";

interface ProductSuggestionsProps {
  suggestions: ProductSuggestion[];
  loading: boolean;
  onSelect: (suggestion: ProductSuggestion) => void;
}

const ProductSuggestions = ({
  suggestions,
  loading,
  onSelect,
}: ProductSuggestionsProps) => {
  if (loading) {
    return (
      <div className="suggestions">
        <div className="suggestion-item">Searching...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="suggestions">
        <div className="suggestion-item">No products found</div>
      </div>
    );
  }

  return (
    <div className="suggestions">
      {suggestions.map((suggestion) => (
        <button
          type="button"
          key={suggestion.productId}
          className="suggestion-item"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion.productName}
        </button>
      ))}
    </div>
  );
};

export default ProductSuggestions;

import type { MouseEvent, ReactNode } from "react";
import type { ProductSuggestion } from "../types/productSearch";

interface ProductSuggestionsProps {
  suggestions: ProductSuggestion[];
  loading: boolean;
  onSelect: (suggestion: ProductSuggestion) => void;
}

// Keeps focus in the search input while the list is clicked, so the list is
// not closed by the input's blur before the click lands.
const keepInputFocused = (event: MouseEvent) => event.preventDefault();

const SuggestionList = ({ children }: { children: ReactNode }) => (
  <div className="suggestions" onMouseDown={keepInputFocused}>
    {children}
  </div>
);

const ProductSuggestions = ({
  suggestions,
  loading,
  onSelect,
}: ProductSuggestionsProps) => {
  if (loading) {
    return (
      <SuggestionList>
        <div className="suggestion-item">Searching...</div>
      </SuggestionList>
    );
  }

  if (suggestions.length === 0) {
    return (
      <SuggestionList>
        <div className="suggestion-item">No suggestions found</div>
      </SuggestionList>
    );
  }

  return (
    <SuggestionList>
      {suggestions.map((suggestion) => (
        <button
          type="button"
          key={`${suggestion.type}:${suggestion.id}`}
          className="suggestion-item"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion.label}
        </button>
      ))}
    </SuggestionList>
  );
};

export default ProductSuggestions;

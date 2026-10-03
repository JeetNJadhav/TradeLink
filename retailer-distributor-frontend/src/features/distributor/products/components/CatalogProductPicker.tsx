import { useState, type FocusEvent, type MouseEvent } from "react";
import { env } from "../../../../shared/config/env";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import useCatalogProducts, {
  MIN_CATALOG_QUERY_LENGTH,
} from "../hooks/useCatalogProducts";
import type { CatalogProduct } from "../types/listing";

interface CatalogProductPickerProps {
  // Products the distributor already lists; they cannot be picked again.
  listedProductIds: ReadonlySet<string>;
  disabled: boolean;
  onPick: (product: CatalogProduct) => void;
}

// Keeps focus in the search input while the list is clicked, so the list is
// not closed by the input's blur before the click lands.
const keepInputFocused = (event: MouseEvent) => event.preventDefault();

// Searches the master product list and hands back the product that was picked.
const CatalogProductPicker = ({
  listedProductIds,
  disabled,
  onPick,
}: CatalogProductPickerProps) => {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const debouncedSearch = useDebouncedValue(search, env.suggestionDebounceMs);
  const { products, loading, error } = useCatalogProducts(debouncedSearch);

  const canSearch = search.trim().length >= MIN_CATALOG_QUERY_LENGTH;
  // Until the debounce catches up, the results belong to older text.
  const searching = loading || debouncedSearch !== search;

  const handlePick = (product: CatalogProduct) => {
    setSearch("");
    setShowResults(false);
    onPick(product);
  };

  // Close when focus leaves the input and its results.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setShowResults(false);
    }
  };

  let results;

  if (searching) {
    results = <div className="suggestion-item">Searching...</div>;
  } else if (error) {
    results = <div className="suggestion-item">{error.message}</div>;
  } else if (products.length === 0) {
    results = <div className="suggestion-item">No products found</div>;
  } else {
    results = products.map((product) => {
      const listed = listedProductIds.has(product.id);

      return (
        <button
          type="button"
          key={product.id}
          className="suggestion-item"
          disabled={listed}
          onClick={() => handlePick(product)}
        >
          {product.name} · {product.brand} · {product.category}
          {listed && " (already listed)"}
        </button>
      );
    });
  }

  return (
    <div className="search-input-wrapper" onBlur={handleBlur}>
      <input
        type="text"
        value={search}
        placeholder="Search the catalog by product or brand..."
        aria-label="Search the catalog"
        disabled={disabled}
        onChange={(event) => {
          setSearch(event.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setShowResults(false);
        }}
      />

      {showResults && canSearch && (
        <div className="suggestions" onMouseDown={keepInputFocused}>
          {results}
        </div>
      )}
    </div>
  );
};

export default CatalogProductPicker;

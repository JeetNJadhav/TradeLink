import type { NavigateFunction } from "react-router-dom";
import type { ProductSuggestion, SuggestionType } from "./types/productSearch";

interface SuggestionActionContext {
  search: (query: string) => void;
  navigate: NavigateFunction;
}

type SuggestionAction = (
  suggestion: ProductSuggestion,
  context: SuggestionActionContext,
) => void;

const searchByLabel: SuggestionAction = (suggestion, { search }) =>
  search(suggestion.label);

// What picking a suggestion does, per suggestion type. A new type only needs
// an entry here.
export const SUGGESTION_ACTIONS: Record<SuggestionType, SuggestionAction> = {
  product: searchByLabel,
  brand: searchByLabel,
  distributor: (suggestion, { navigate }) =>
    navigate(`/distributors/${suggestion.id}/products`),
};

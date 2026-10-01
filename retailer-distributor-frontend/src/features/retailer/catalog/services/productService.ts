import { PRODUCT_SEARCH_API, PRODUCT_SUGGESTIONS_API } from "../../../../shared/api/api";
import apiClient from "../../../../shared/api/apiClient";
import type {
  ProductSearchResponse,
  ProductSearchResult,
  ProductSuggestion,
  ProductSuggestionsResponse,
} from "../types/productSearch";

export interface ProductSearchParams {
  query: string;
  latitude?: number;
  longitude?: number;
  sortBy?: "relevance" | "nearest";
}

export const searchProducts = async (
  { query, latitude, longitude, sortBy }: ProductSearchParams,
  signal?: AbortSignal,
): Promise<ProductSearchResult[]> => {
  const response = await apiClient.get<ProductSearchResponse>(PRODUCT_SEARCH_API, {
    // axios leaves out params that are undefined
    params: { q: query, latitude, longitude, sortBy },
    signal,
  });
  return response.data.data.products;
};

export const getProductSuggestions = async (
  query: string,
  signal?: AbortSignal,
): Promise<ProductSuggestion[]> => {
  const response = await apiClient.get<ProductSuggestionsResponse>(PRODUCT_SUGGESTIONS_API, {
    params: { q: query },
    signal,
  });
  return response.data.data.suggestions;
};

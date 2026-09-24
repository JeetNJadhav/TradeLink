import { PRODUCT_SEARCH_API, PRODUCT_SUGGESTIONS_API } from "../../../shared/api/api";
import apiClient from "../../../shared/api/apiClient";
import type { ProductSearchResult, ProductSuggestion } from "../types/productSearch";

export interface ProductSearchParams {
  query: string;
  latitude?: number;
  longitude?: number;
  sortBy?: "relevance" | "nearest";
}

interface ProductSearchResponse {
  success: boolean;
  data: { products: ProductSearchResult[] };
}

interface ProductSuggestionsResponse {
  success: boolean;
  data: { suggestions: ProductSuggestion[] };
}

export const searchProducts = async ({ query, latitude, longitude, sortBy }: ProductSearchParams) => {
  const params = new URLSearchParams({ q: query });
  if (latitude !== undefined) params.set("latitude", latitude.toString());
  if (longitude !== undefined) params.set("longitude", longitude.toString());
  if (sortBy) params.set("sortBy", sortBy);

  const response = await apiClient.get<ProductSearchResponse>(PRODUCT_SEARCH_API, {
    params: Object.fromEntries(params),
  });
  return response.data;
};

export const getProductSuggestions = async (query: string, signal?: AbortSignal) => {
  const response = await apiClient.get<ProductSuggestionsResponse>(PRODUCT_SUGGESTIONS_API, {
    params: { q: query },
    signal,
  });
  return response.data;
};

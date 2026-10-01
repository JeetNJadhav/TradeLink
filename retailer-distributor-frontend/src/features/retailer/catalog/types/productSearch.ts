import type { ApiResponse } from "../../../../shared/api/types";

export interface ProductSearchResult {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  brand: string;

  distributorId: string;
  distributorName: string;

  price: number;
  stock: number;

  location: {
    lat: number;
    lon: number;
  };

  updatedAt: string;
}

export type SuggestionType = "product" | "brand" | "distributor";

export interface ProductSuggestion {
  type: SuggestionType;
  id: string;
  label: string;
}

export type ProductSearchResponse = ApiResponse<{
  products: ProductSearchResult[];
}>;

export type ProductSuggestionsResponse = ApiResponse<{
  suggestions: ProductSuggestion[];
}>;

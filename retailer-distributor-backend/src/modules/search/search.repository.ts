export interface SearchDocument {
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

export interface ProductSearchParams {
  query: string;
  latitude?: number;
  longitude?: number;
  sortBy?: "relevance" | "nearest";
}

// This is our abstraction.
export interface SearchRepository {
  // opensearch scripts
  indexProductDistributor(document: SearchDocument): Promise<void>;

  searchProducts(params: ProductSearchParams): Promise<SearchDocument[]>;

  getProductSuggestions(query: string): Promise<ProductSuggestion[]>;
}

export type SuggestionType = "product" | "brand" | "distributor";

export interface ProductSuggestion {
  type: SuggestionType;
  id: string;
  label: string;
}

// for future: replace above searchRepository with
// export interface ProductSearcher {
//   searchProducts(
//     params: ProductSearchParams
//   ): Promise<SearchDocument[]>;
// }

// export interface ProductSuggestionProvider {
//   getProductSuggestions(
//     query: string
//   ): Promise<ProductSuggestion[]>;
// }

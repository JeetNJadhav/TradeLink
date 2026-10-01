import {
  ProductSearchParams,
  ProductSuggestion,
  SearchDocument,
} from "./search.types";

// This is our abstraction.
export interface SearchRepository {
  // opensearch scripts
  indexProductDistributor(document: SearchDocument): Promise<void>;

  searchProducts(params: ProductSearchParams): Promise<SearchDocument[]>;

  getProductSuggestions(query: string): Promise<ProductSuggestion[]>;
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

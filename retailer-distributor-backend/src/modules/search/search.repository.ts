import {
  ProductSearchParams,
  ProductSuggestion,
  SearchDocument,
} from "./search.types";

// Read side: what the search service needs.
export interface SearchRepository {
  searchProducts(params: ProductSearchParams): Promise<SearchDocument[]>;

  getProductSuggestions(query: string): Promise<ProductSuggestion[]>;
}

// Write side: used by the indexing scripts.
export interface SearchIndexer {
  indexProductDistributor(document: SearchDocument): Promise<void>;
}

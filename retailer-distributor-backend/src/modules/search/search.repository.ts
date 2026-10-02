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
  // Creates the index with its mappings. Returns false when it already exists.
  createIndex(): Promise<boolean>;

  // Drops the index and creates it empty, so a reindex leaves no documents
  // behind for listings that no longer exist.
  recreateIndex(): Promise<void>;

  indexProductDistributors(documents: SearchDocument[]): Promise<void>;
}

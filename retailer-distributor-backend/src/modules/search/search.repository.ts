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

// Write side: used by the indexing scripts, and by orders to keep stock current.
export interface SearchIndexer {
  // Sets the stock of one listing's document. Does nothing when the listing
  // is not in the index.
  updateStock(distributorProductId: string, stock: number): Promise<void>;

  // Creates the index with its mappings. Returns false when it already exists.
  createIndex(): Promise<boolean>;

  // Drops the index and creates it empty, so a reindex leaves no documents
  // behind for listings that no longer exist.
  recreateIndex(): Promise<void>;

  indexProductDistributors(documents: SearchDocument[]): Promise<void>;
}

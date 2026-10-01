import { SearchRepository } from "./search.repository";
import {
  ProductSearchParams,
  ProductSuggestion,
  SearchDocument,
} from "./search.types";

export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async searchProducts(params: ProductSearchParams): Promise<SearchDocument[]> {
    if (!params.query.trim()) {
      return [];
    }

    return this.searchRepository.searchProducts({
      ...params,
      query: params.query.trim(),
    });
  }

  async getProductSuggestions(query: string): Promise<ProductSuggestion[]> {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      return [];
    }

    return this.searchRepository.getProductSuggestions(trimmedQuery);
  }
}

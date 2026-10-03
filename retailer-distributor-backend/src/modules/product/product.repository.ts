import type { Product } from "./product.types";

// The master product list. Distributors pick the products they list from it.
export interface ProductRepository {
  exists(id: string): Promise<boolean>;

  // Products whose name or brand contains the query, ordered by name.
  // Without a query, the first products by name.
  search(query: string | undefined, limit: number): Promise<Product[]>;
}

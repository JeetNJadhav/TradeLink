import type { DistributorProductRepository } from "../distributorProduct/distributorProduct.repository";
import type { ProductRepository } from "./product.repository";

export class ProductService {
  constructor(
    private readonly distributorProductRepository: Pick<
      DistributorProductRepository,
      "findByProductId"
    >,
    private readonly productRepository: Pick<ProductRepository, "search">,
  ) {}

  async getProductDistributors(productId: string) {
    return this.distributorProductRepository.findByProductId(productId);
  }

  // The master product list, for a distributor choosing what to list.
  async searchCatalog(query: string | undefined, limit: number) {
    return this.productRepository.search(query?.trim() || undefined, limit);
  }
}

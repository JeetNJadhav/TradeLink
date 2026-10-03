import type { DistributorProductRepository } from "../distributorProduct/distributorProduct.repository";

export class ProductService {
  constructor(
    private readonly distributorProductRepository: Pick<
      DistributorProductRepository,
      "findByProductId"
    >,
  ) {}

  async getProductDistributors(productId: string) {
    return this.distributorProductRepository.findByProductId(productId);
  }
}

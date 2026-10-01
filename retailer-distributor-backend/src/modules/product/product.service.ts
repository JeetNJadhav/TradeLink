import { DistributorProductRepository } from "../distributorProduct/distributorProduct.repository";

export class ProductService {
  constructor(
    private readonly distributorProductRepository: DistributorProductRepository,
  ) {}

  async getProductDistributors(productId: string) {
    return this.distributorProductRepository.findByProductId(productId);
  }
}

import type { DistributorProductRepository } from "./distributorProduct.repository";

export class DistributorProductService {
  constructor(
    private readonly distributorProductRepository: DistributorProductRepository,
  ) {}

  async getDistributorProductById(id: string) {
    return this.distributorProductRepository.findById(id);
  }
}

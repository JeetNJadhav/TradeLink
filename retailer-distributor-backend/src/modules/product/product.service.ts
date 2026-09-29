import { ProductRepository } from "./product.repository";

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProductDistributors(productId: string) {
    return this.productRepository.findDistributorsByProductId(productId);
  }
}

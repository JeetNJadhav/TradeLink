import { PrismaClient } from "../../../generated/prisma/client";
import {
  DistributorProductWithDistributor,
  ProductRepository,
} from "../../../modules/product/product.repository";

// give me the distributors for this product
export class DistributorProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findDistributorsByProductId(
    productId: string,
  ): Promise<DistributorProductWithDistributor[]> {
    const results = await this.prisma.distributorProduct.findMany({
      where: { productId },
      include: {
        distributor: {
          include: {
            locations: true,
          },
        },
      },
    });

    return results.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    }));
  }
}

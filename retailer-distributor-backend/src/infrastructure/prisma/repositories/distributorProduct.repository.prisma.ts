import { PrismaClient } from "../../../generated/prisma/client";
import type { DistributorProductRepository } from "../../../modules/distributorProduct/distributorProduct.repository";
import type {
  DistributorProductWithDetails,
  DistributorProductWithDistributor,
  DistributorProductWithProduct,
} from "../../../modules/distributorProduct/distributorProduct.types";

export class PrismaDistributorProductRepository
  implements DistributorProductRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DistributorProductWithDetails | null> {
    const distributorProduct = await this.prisma.distributorProduct.findUnique({
      where: { id },
      include: {
        product: true,
        distributor: {
          include: {
            locations: true,
          },
        },
      },
    });

    if (!distributorProduct) {
      return null;
    }

    return {
      ...distributorProduct,
      price: distributorProduct.price.toNumber(),
    };
  }

  async findByDistributorId(
    distributorId: string,
  ): Promise<DistributorProductWithProduct[]> {
    const results = await this.prisma.distributorProduct.findMany({
      where: { distributorId },
      include: {
        product: true,
      },
    });

    return results.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    }));
  }

  // give me the distributors for this product
  async findByProductId(
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

import type { PrismaDb } from "../prisma.client";
import type { DistributorProductRepository } from "../../../modules/distributorProduct/distributorProduct.repository";
import type {
  DistributorProductPricing,
  DistributorProductWithDetails,
  DistributorProductWithDistributor,
  DistributorProductWithProduct,
} from "../../../modules/distributorProduct/distributorProduct.types";

export class PrismaDistributorProductRepository
  implements DistributorProductRepository
{
  constructor(private readonly prisma: PrismaDb) {}

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

  async findAllWithDetails(): Promise<DistributorProductWithDetails[]> {
    const results = await this.prisma.distributorProduct.findMany({
      include: {
        product: true,
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

  async findPricing(
    distributorId: string,
    productId: string,
  ): Promise<DistributorProductPricing | null> {
    const distributorProduct = await this.prisma.distributorProduct.findUnique({
      where: {
        distributorId_productId: {
          distributorId,
          productId,
        },
      },
    });

    if (!distributorProduct) {
      return null;
    }

    return {
      id: distributorProduct.id,
      unitPrice: distributorProduct.price.toString(),
    };
  }

  // The stock update is conditional: PostgreSQL updates the row only when
  // enough stock remains. This prevents two concurrent orders from both
  // successfully reserving the same inventory. The same statement returns the
  // stock that is left, so the caller never reads a stale value.
  async reserveStock(
    distributorId: string,
    productId: string,
    quantity: number,
  ): Promise<number | null> {
    const updated = await this.prisma.distributorProduct.updateManyAndReturn({
      where: {
        distributorId,
        productId,
        stock: {
          gte: quantity,
        },
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
      select: {
        stock: true,
      },
    });

    return updated[0]?.stock ?? null;
  }
}

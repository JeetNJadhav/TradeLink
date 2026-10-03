import type { Prisma } from "../../../generated/prisma/client";
import type { PrismaDb } from "../prisma.client";
import { ListingConflictError } from "../../../modules/distributorProduct/distributorProduct.errors";
import type { DistributorProductRepository } from "../../../modules/distributorProduct/distributorProduct.repository";
import type {
  DistributorProductPricing,
  DistributorProductWithDetails,
  DistributorProductWithDistributor,
  DistributorProductWithProduct,
  ListingChanges,
  NewListing,
} from "../../../modules/distributorProduct/distributorProduct.types";
import { isUniqueViolation } from "../prisma.errors";

// The distributor of a listing, without the id of the user who owns it.
const publicDistributor = {
  omit: { userId: true },
  include: { locations: true },
} satisfies Prisma.DistributorDefaultArgs;

// A listing its distributor has not removed. Removed listings stay in the
// table for their orders, and are invisible to every read in this file.
const listed = {
  isActive: true,
} satisfies Prisma.DistributorProductWhereInput;

export class PrismaDistributorProductRepository
  implements DistributorProductRepository
{
  constructor(private readonly prisma: PrismaDb) {}

  async findById(id: string): Promise<DistributorProductWithDetails | null> {
    const distributorProduct = await this.prisma.distributorProduct.findFirst({
      where: { id, ...listed },
      include: {
        product: true,
        distributor: publicDistributor,
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
      where: { distributorId, ...listed },
      include: {
        product: true,
      },
      orderBy: [{ product: { name: "asc" } }, { id: "asc" }],
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
      where: { productId, ...listed },
      include: {
        distributor: publicDistributor,
      },
    });

    return results.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    }));
  }

  async findAllWithDetails(): Promise<DistributorProductWithDetails[]> {
    const results = await this.prisma.distributorProduct.findMany({
      where: listed,
      include: {
        product: true,
        distributor: publicDistributor,
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
    const distributorProduct = await this.prisma.distributorProduct.findFirst({
      where: { distributorId, productId, ...listed },
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
        ...listed,
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

  async releaseStock(
    distributorProductId: string,
    quantity: number,
  ): Promise<number> {
    const updated = await this.prisma.distributorProduct.update({
      where: { id: distributorProductId },
      data: {
        stock: {
          increment: quantity,
        },
      },
      select: {
        stock: true,
      },
    });

    return updated.stock;
  }

  async create(listing: NewListing): Promise<string> {
    const { distributorId, productId, price, stock } = listing;

    // The row of a removed listing is reused, so its past orders and the
    // one-listing-per-product constraint both stay intact.
    const relisted = await this.prisma.distributorProduct.updateManyAndReturn({
      where: { distributorId, productId, isActive: false },
      data: { price, stock, isActive: true },
      select: { id: true },
    });

    if (relisted[0]) {
      return relisted[0].id;
    }

    try {
      const created = await this.prisma.distributorProduct.create({
        data: { distributorId, productId, price, stock },
        select: { id: true },
      });

      return created.id;
    } catch (error) {
      // The only unique value is the distributor and product pair.
      if (isUniqueViolation(error)) {
        throw new ListingConflictError();
      }

      throw error;
    }
  }

  // One UPDATE: PostgreSQL applies it and a concurrent reserveStock or
  // releaseStock one after the other, never from a stale read.
  async updateOwned(
    id: string,
    distributorId: string,
    changes: ListingChanges,
  ): Promise<boolean> {
    const { count } = await this.prisma.distributorProduct.updateMany({
      where: { id, distributorId, ...listed },
      data: { price: changes.price, stock: changes.stock },
    });

    return count > 0;
  }

  async deactivateOwned(id: string, distributorId: string): Promise<boolean> {
    const { count } = await this.prisma.distributorProduct.updateMany({
      where: { id, distributorId, ...listed },
      data: { isActive: false },
    });

    return count > 0;
  }
}

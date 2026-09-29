import { prisma } from "../prisma.client";
import type {
  DistributorRepository,
  DistributorWithLocations,
  DistributorWithProducts,
  DistributorProductWithProduct,
  DistributorProductWithDetails,
} from "../../../modules/distributor/distributor.repository";

export class PrismaDistributorRepository implements DistributorRepository {
  async getDistributors(): Promise<DistributorWithLocations[]> {
    const distributors = await prisma.distributor.findMany({
      include: {
        locations: true,
      },
    });

    return distributors.map((distributor) => ({
      ...distributor,
      locations: distributor.locations,
    }));
  }

  async getDistributorById(
    id: string,
  ): Promise<DistributorWithProducts | null> {
    const distributor = await prisma.distributor.findUnique({
      where: { id },
      include: {
        locations: true,
        distributorProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!distributor) {
      return null;
    }

    return {
      ...distributor,
      distributorProducts: distributor.distributorProducts.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      })),
    };
  }

  async getDistributorProducts(
    distributorId: string,
  ): Promise<DistributorProductWithProduct[]> {
    const products = await prisma.distributorProduct.findMany({
      where: {
        distributorId,
      },
      include: {
        product: true,
      },
    });

    return products.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    }));
  }

  async getDistributorProductById(
    id: string,
  ): Promise<DistributorProductWithDetails | null> {
    const distributorProduct = await prisma.distributorProduct.findUnique({
      where: {
        id,
      },
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
}

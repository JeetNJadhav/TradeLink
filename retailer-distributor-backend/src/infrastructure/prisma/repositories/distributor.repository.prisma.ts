import { prisma } from "../prisma.client";
import type { DistributorRepository } from "../../../modules/distributor/distributor.repository";
import type {
  DistributorWithLocations,
  DistributorWithProducts,
} from "../../../modules/distributor/distributor.types";

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
}

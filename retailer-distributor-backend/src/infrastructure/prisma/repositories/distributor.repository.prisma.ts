import type { PrismaDb } from "../prisma.client";
import type { DistributorRepository } from "../../../modules/distributor/distributor.repository";
import type {
  Distributor,
  DistributorWithLocations,
  DistributorWithProducts,
} from "../../../modules/distributor/distributor.types";

export class PrismaDistributorRepository implements DistributorRepository {
  constructor(private readonly prisma: PrismaDb) {}

  async getDistributors(): Promise<DistributorWithLocations[]> {
    const distributors = await this.prisma.distributor.findMany({
      omit: { userId: true },
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
    const distributor = await this.prisma.distributor.findUnique({
      where: { id },
      omit: { userId: true },
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

  async findByUserId(userId: string): Promise<Distributor | null> {
    return this.prisma.distributor.findUnique({
      where: { userId },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.distributor.count({
      where: { id },
    });

    return count > 0;
  }
}

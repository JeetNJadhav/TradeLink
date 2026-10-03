import type { PrismaDb } from "../prisma.client";
import type { DistributorRepository } from "../../../modules/distributor/distributor.repository";
import type { Distributor } from "../../../modules/distributor/distributor.types";

export class PrismaDistributorRepository implements DistributorRepository {
  constructor(private readonly prisma: PrismaDb) {}

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

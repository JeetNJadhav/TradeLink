import type { PrismaDb } from "../prisma.client";
import type { RetailerRepository } from "../../../modules/retailer/retailer.repository";
import type { Retailer } from "../../../modules/retailer/retailer.types";

export class PrismaRetailerRepository implements RetailerRepository {
  constructor(private readonly prisma: PrismaDb) {}

  async findByUserId(userId: string): Promise<Retailer | null> {
    return this.prisma.retailer.findUnique({
      where: { userId },
    });
  }
}

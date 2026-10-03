import type { PrismaDb } from "../prisma.client";
import type { ProductRepository } from "../../../modules/product/product.repository";
import type { Product } from "../../../modules/product/product.types";

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaDb) {}

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { id },
    });

    return count > 0;
  }

  async search(query: string | undefined, limit: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: limit,
    });
  }
}

import type { PrismaClient } from "../../generated/prisma/client";
import type {
  OrderTransaction,
  OrderUnitOfWork,
} from "../../modules/order/order.unitOfWork";
import { PrismaDistributorRepository } from "./repositories/distributor.repository.prisma";
import { PrismaDistributorProductRepository } from "./repositories/distributorProduct.repository.prisma";
import { PrismaOrderRepository } from "./repositories/order.repository.prisma";
import { PrismaRetailerRepository } from "./repositories/retailer.repository.prisma";

export class PrismaOrderUnitOfWork implements OrderUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  run<T>(work: (transaction: OrderTransaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      work({
        orders: new PrismaOrderRepository(tx),
        retailers: new PrismaRetailerRepository(tx),
        distributors: new PrismaDistributorRepository(tx),
        distributorProducts: new PrismaDistributorProductRepository(tx),
      }),
    );
  }
}

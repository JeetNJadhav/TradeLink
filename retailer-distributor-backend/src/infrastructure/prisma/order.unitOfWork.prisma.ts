import type { PrismaClient } from "../../generated/prisma/client";
import type {
  OrderTransaction,
  OrderUnitOfWork,
} from "../../modules/order/order.unitOfWork";
import type { PrismaDb } from "./prisma.client";
import { PrismaDistributorRepository } from "./repositories/distributor.repository.prisma";
import { PrismaDistributorProductRepository } from "./repositories/distributorProduct.repository.prisma";
import { PrismaOrderRepository } from "./repositories/order.repository.prisma";
import { PrismaRetailerRepository } from "./repositories/retailer.repository.prisma";

const repositoriesOn = (db: PrismaDb): OrderTransaction => ({
  orders: new PrismaOrderRepository(db),
  retailers: new PrismaRetailerRepository(db),
  distributors: new PrismaDistributorRepository(db),
  distributorProducts: new PrismaDistributorProductRepository(db),
});

export class PrismaOrderUnitOfWork implements OrderUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  run<T>(work: (transaction: OrderTransaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => work(repositoriesOn(tx)));
  }

  read<T>(work: (repositories: OrderTransaction) => Promise<T>): Promise<T> {
    return work(repositoriesOn(this.prisma));
  }
}

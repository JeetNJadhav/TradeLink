import type { DistributorRepository } from "../distributor/distributor.repository";
import type { DistributorProductRepository } from "../distributorProduct/distributorProduct.repository";
import type { RetailerRepository } from "../retailer/retailer.repository";
import type { OrderRepository } from "./order.repository";

// The repositories an order needs, all bound to the same transaction.
export interface OrderTransaction {
  orders: OrderRepository;
  retailers: RetailerRepository;
  distributors: Pick<DistributorRepository, "exists" | "findByUserId">;
  distributorProducts: Pick<
    DistributorProductRepository,
    "findPricing" | "reserveStock" | "releaseStock"
  >;
}

// Runs the work atomically: if it throws, nothing it wrote is kept.
export interface OrderUnitOfWork {
  run<T>(work: (transaction: OrderTransaction) => Promise<T>): Promise<T>;
}

import type { OrderDistributor } from "./order.types";

// The distributors of an order, one entry each, from the distributor of every item.
export const distinctDistributors = (
  distributors: OrderDistributor[],
): OrderDistributor[] => [
  ...new Map(
    distributors.map((distributor) => [distributor.id, distributor]),
  ).values(),
];

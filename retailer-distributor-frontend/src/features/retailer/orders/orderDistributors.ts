import type { OrderDistributor } from "./types/order";

// An order usually has one distributor, but may have several.
export const distributorNames = (distributors: OrderDistributor[]) =>
  distributors.map((distributor) => distributor.businessName).join(", ");

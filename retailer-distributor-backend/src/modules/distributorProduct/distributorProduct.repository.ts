import type {
  DistributorProductPricing,
  DistributorProductWithDetails,
  DistributorProductWithDistributor,
  DistributorProductWithProduct,
} from "./distributorProduct.types";

// Single owner of DistributorProduct data access.
export interface DistributorProductRepository {
  findById(id: string): Promise<DistributorProductWithDetails | null>;

  findByDistributorId(
    distributorId: string,
  ): Promise<DistributorProductWithProduct[]>;

  findByProductId(
    productId: string,
  ): Promise<DistributorProductWithDistributor[]>;

  findAllWithDetails(): Promise<DistributorProductWithDetails[]>;

  findPricing(
    distributorId: string,
    productId: string,
  ): Promise<DistributorProductPricing | null>;

  // Decrements stock only if enough remains. Returns the stock left after the
  // reservation, or null when there was not enough.
  reserveStock(
    distributorId: string,
    productId: string,
    quantity: number,
  ): Promise<number | null>;
}

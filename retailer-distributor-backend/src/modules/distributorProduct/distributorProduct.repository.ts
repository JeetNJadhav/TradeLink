import type {
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
}

import type {
  DistributorProductPricing,
  DistributorProductWithDetails,
  DistributorProductWithDistributor,
  DistributorProductWithProduct,
  ListingChanges,
  NewListing,
} from "./distributorProduct.types";

// Single owner of DistributorProduct data access. Every read and the stock
// reservation see active listings only; a removed listing behaves as missing.
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

  // Gives reserved stock back to a listing, e.g. when its order is rejected.
  // Returns the stock the listing has afterwards.
  releaseStock(distributorProductId: string, quantity: number): Promise<number>;

  // Lists a product for a distributor and returns the listing's id. A listing
  // the distributor removed earlier is brought back with the new price and
  // stock. Throws ListingConflictError when the product is already listed.
  create(listing: NewListing): Promise<string>;

  // Sets the price and/or stock of a listing in one statement, so it cannot
  // interleave with a stock reservation. Returns false when the distributor
  // has no such active listing.
  updateOwned(
    id: string,
    distributorId: string,
    changes: ListingChanges,
  ): Promise<boolean>;

  // Removes a listing from sale without deleting it. Returns false when the
  // distributor has no such active listing.
  deactivateOwned(id: string, distributorId: string): Promise<boolean>;
}

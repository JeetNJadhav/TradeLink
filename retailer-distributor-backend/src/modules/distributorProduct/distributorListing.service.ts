import type { DistributorRepository } from "../distributor/distributor.repository";
import type { ProductRepository } from "../product/product.repository";
import { ListingConflictError, ListingError } from "./distributorProduct.errors";
import {
  indexListing,
  unindexListing,
  type ListingIndex,
} from "./distributorProduct.listingIndex";
import type { DistributorProductRepository } from "./distributorProduct.repository";
import type {
  AddListingInput,
  DistributorProductWithDetails,
  DistributorProductWithProduct,
  ListingChanges,
} from "./distributorProduct.types";

type ListingRepository = Pick<
  DistributorProductRepository,
  | "findById"
  | "findByDistributorId"
  | "create"
  | "updateOwned"
  | "deactivateOwned"
>;

// What a distributor can do with its own listings.
export class DistributorListingService {
  constructor(
    private readonly listings: ListingRepository,
    private readonly distributors: Pick<DistributorRepository, "findByUserId">,
    private readonly products: Pick<ProductRepository, "exists">,
    private readonly listingIndex: ListingIndex,
  ) {}

  async listListings(userId: string): Promise<DistributorProductWithProduct[]> {
    const distributorId = await this.resolveDistributorId(userId);

    return this.listings.findByDistributorId(distributorId);
  }

  async addListing(
    userId: string,
    input: AddListingInput,
  ): Promise<DistributorProductWithDetails> {
    const distributorId = await this.resolveDistributorId(userId);

    if (!(await this.products.exists(input.productId))) {
      throw new ListingError("Product not found", 404);
    }

    const id = await this.createListing(distributorId, input);
    const listing = await this.findListing(id);

    await indexListing(this.listingIndex, listing);

    return listing;
  }

  async updateListing(
    userId: string,
    distributorProductId: string,
    changes: ListingChanges,
  ): Promise<DistributorProductWithDetails> {
    const distributorId = await this.resolveDistributorId(userId);

    const updated = await this.listings.updateOwned(
      distributorProductId,
      distributorId,
      { price: changes.price, stock: changes.stock },
    );

    if (!updated) {
      throw new ListingError("Listing not found", 404);
    }

    const listing = await this.findListing(distributorProductId);

    await indexListing(this.listingIndex, listing);

    return listing;
  }

  // The listing is only switched off: orders that were placed on it keep it.
  async removeListing(
    userId: string,
    distributorProductId: string,
  ): Promise<void> {
    const distributorId = await this.resolveDistributorId(userId);

    const removed = await this.listings.deactivateOwned(
      distributorProductId,
      distributorId,
    );

    if (!removed) {
      throw new ListingError("Listing not found", 404);
    }

    await unindexListing(this.listingIndex, distributorProductId);
  }

  private async createListing(
    distributorId: string,
    input: AddListingInput,
  ): Promise<string> {
    try {
      return await this.listings.create({
        distributorId,
        productId: input.productId,
        price: input.price,
        stock: input.stock,
      });
    } catch (error) {
      if (error instanceof ListingConflictError) {
        throw new ListingError(error.message, 409);
      }

      throw error;
    }
  }

  // The authenticated user's id is User.id; listings belong to their Distributor profile.
  private async resolveDistributorId(userId: string): Promise<string> {
    const distributor = await this.distributors.findByUserId(userId);

    if (!distributor) {
      throw new ListingError("Distributor not found", 404);
    }

    return distributor.id;
  }

  // A listing of another distributor never gets here: every write is matched
  // against the caller's distributor id first.
  private async findListing(id: string): Promise<DistributorProductWithDetails> {
    const listing = await this.listings.findById(id);

    if (!listing) {
      throw new ListingError("Listing not found", 404);
    }

    return listing;
  }
}

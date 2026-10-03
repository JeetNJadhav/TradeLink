import { randomUUID } from "node:crypto";
import type {
  Distributor,
  DistributorLocation,
} from "../../src/modules/distributor/distributor.types";
import { ListingConflictError } from "../../src/modules/distributorProduct/distributorProduct.errors";
import type { ListingIndex } from "../../src/modules/distributorProduct/distributorProduct.listingIndex";
import type { DistributorProductRepository } from "../../src/modules/distributorProduct/distributorProduct.repository";
import type {
  DistributorProduct,
  DistributorProductWithDetails,
} from "../../src/modules/distributorProduct/distributorProduct.types";
import type { Product } from "../../src/modules/product/product.types";
import type { SearchDocument } from "../../src/modules/search/search.types";

export interface ListingState {
  distributors: Distributor[];
  locations: DistributorLocation[];
  products: Product[];
  listings: DistributorProduct[];
}

// Records what the service sends to the search index, in order.
export class RecordingListingIndex implements ListingIndex {
  upserts: SearchDocument[] = [];
  removals: string[] = [];

  async upsertListing(document: SearchDocument) {
    this.upserts.push(document);
  }

  async removeListing(distributorProductId: string) {
    this.removals.push(distributorProductId);
  }
}

// Keeps listings in memory. Like the real repository, every read sees active
// listings only and a write matches the listing against its distributor.
export class InMemoryListings {
  constructor(public state: ListingState) {}

  private withDetails(listing: DistributorProduct): DistributorProductWithDetails {
    const { userId: _userId, ...distributor } = this.state.distributors.find(
      (candidate) => candidate.id === listing.distributorId,
    )!;

    return {
      ...listing,
      product: this.state.products.find(
        (candidate) => candidate.id === listing.productId,
      )!,
      distributor: {
        ...distributor,
        locations: this.state.locations.filter(
          (location) => location.distributorId === distributor.id,
        ),
      },
    };
  }

  private owned(id: string, distributorId: string) {
    return this.state.listings.find(
      (candidate) =>
        candidate.id === id &&
        candidate.distributorId === distributorId &&
        candidate.isActive,
    );
  }

  readonly listings: Pick<
    DistributorProductRepository,
    | "findById"
    | "findByDistributorId"
    | "create"
    | "updateOwned"
    | "deactivateOwned"
  > = {
    findById: async (id) => {
      const listing = this.state.listings.find(
        (candidate) => candidate.id === id && candidate.isActive,
      );

      return listing ? this.withDetails(listing) : null;
    },

    findByDistributorId: async (distributorId) =>
      this.state.listings
        .filter(
          (listing) =>
            listing.distributorId === distributorId && listing.isActive,
        )
        .map((listing) => this.withDetails(listing)),

    create: async ({ distributorId, productId, price, stock }) => {
      const existing = this.state.listings.find(
        (candidate) =>
          candidate.distributorId === distributorId &&
          candidate.productId === productId,
      );

      if (existing?.isActive) {
        throw new ListingConflictError();
      }

      if (existing) {
        Object.assign(existing, { price, stock, isActive: true });
        return existing.id;
      }

      const id = randomUUID();

      this.state.listings.push({
        id,
        distributorId,
        productId,
        price,
        stock,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    },

    updateOwned: async (id, distributorId, changes) => {
      const listing = this.owned(id, distributorId);

      if (!listing) {
        return false;
      }

      if (changes.price !== undefined) listing.price = changes.price;
      if (changes.stock !== undefined) listing.stock = changes.stock;
      return true;
    },

    deactivateOwned: async (id, distributorId) => {
      const listing = this.owned(id, distributorId);

      if (!listing) {
        return false;
      }

      listing.isActive = false;
      return true;
    },
  };

  readonly distributors = {
    findByUserId: async (userId: string) =>
      this.state.distributors.find(
        (distributor) => distributor.userId === userId,
      ) ?? null,
  };

  readonly products = {
    exists: async (id: string) =>
      this.state.products.some((product) => product.id === id),
  };
}

const now = new Date("2026-01-01T00:00:00Z");

export const DISTRIBUTOR_USER_ID = "user-distributor";
export const OTHER_DISTRIBUTOR_USER_ID = "user-other-distributor";
// A distributor that registered without a location.
export const UNLOCATED_DISTRIBUTOR_USER_ID = "user-unlocated-distributor";

const product = (id: string, name: string): Product => ({
  id,
  name,
  description: null,
  brand: "Brand",
  category: "Category",
  createdAt: now,
  updatedAt: now,
});

const distributor = (
  id: string,
  businessName: string,
  userId: string,
): Distributor => ({
  id,
  businessName,
  contactInfo: null,
  userId,
  createdAt: now,
  updatedAt: now,
});

const listing = (
  id: string,
  distributorId: string,
  productId: string,
  price: number,
  stock: number,
): DistributorProduct => ({
  id,
  distributorId,
  productId,
  price,
  stock,
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

// Three products. The first distributor lists product A, the second lists
// product B, and nobody lists product C yet.
export const createListingState = (): ListingState => ({
  distributors: [
    distributor("distributor-1", "Wholesale One", DISTRIBUTOR_USER_ID),
    distributor("distributor-2", "Wholesale Two", OTHER_DISTRIBUTOR_USER_ID),
    distributor(
      "distributor-3",
      "Wholesale Three",
      UNLOCATED_DISTRIBUTOR_USER_ID,
    ),
  ],
  locations: ["distributor-1", "distributor-2"].map((distributorId) => ({
    id: `location-${distributorId}`,
    address: "1 Market Road",
    city: "Pune",
    latitude: 18.52,
    longitude: 73.85,
    createdAt: now,
    updatedAt: now,
    retailerId: null,
    distributorId,
  })),
  products: [
    product("product-a", "Product A"),
    product("product-b", "Product B"),
    product("product-c", "Product C"),
  ],
  listings: [
    listing("listing-a", "distributor-1", "product-a", 10.5, 10),
    listing("listing-b", "distributor-2", "product-b", 4, 2),
  ],
});

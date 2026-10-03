import type { DistributorWithLocations } from "../distributor/distributor.types";
import type { Product } from "../product/product.types";

// A distributor's listing of a product: its own price and stock.
export interface DistributorProduct {
  id: string;
  price: number;
  stock: number;
  // False once the distributor removed the listing. The row is kept for the
  // orders placed on it, but it is no longer shown, searched or ordered.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  distributorId: string;
  productId: string;
}

export interface DistributorProductWithProduct extends DistributorProduct {
  product: Product;
}

export interface DistributorProductWithDistributor extends DistributorProduct {
  distributor: DistributorWithLocations;
}

export interface DistributorProductWithDetails
  extends DistributorProductWithProduct {
  distributor: DistributorWithLocations;
}

// ---- A distributor managing its own listings ----

export interface AddListingInput {
  productId: string;
  price: number;
  stock: number;
}

export interface NewListing extends AddListingInput {
  distributorId: string;
}

// Price, stock, or both. A field left out is not changed.
export interface ListingChanges {
  price?: number;
  stock?: number;
}

// The price is kept as an exact decimal string so order amounts are not rounded.
export interface DistributorProductPricing {
  id: string;
  unitPrice: string;
}

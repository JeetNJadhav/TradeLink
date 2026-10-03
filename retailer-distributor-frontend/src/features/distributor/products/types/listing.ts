import type { ApiResponse } from "../../../../shared/api/types";

// Same limits as the backend's listing validation.
export const MAX_LISTING_PRICE = 10_000_000;
export const MAX_LISTING_STOCK = 1_000_000;

// At or below this, a listing is flagged as running low.
export const LOW_STOCK_THRESHOLD = 5;

// A product of the master list, which every distributor lists from.
export interface CatalogProduct {
  id: string;
  name: string;
  description: string | null;
  brand: string;
  category: string;
}

// The signed-in distributor's listing of one product.
export interface Listing {
  id: string;
  price: number;
  stock: number;
  productId: string;
  product: CatalogProduct;
}

export interface NewListing {
  productId: string;
  price: number;
  stock: number;
}

// Price, stock, or both. A field left out is not changed.
export interface ListingChanges {
  price?: number;
  stock?: number;
}

export type ListingsResponse = ApiResponse<{
  distributorProducts: Listing[];
}>;

export type ListingResponse = ApiResponse<{
  distributorProduct: Listing;
}>;

export type CatalogProductsResponse = ApiResponse<{
  products: CatalogProduct[];
}>;

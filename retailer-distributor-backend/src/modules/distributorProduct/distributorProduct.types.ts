import type { DistributorWithLocations } from "../distributor/distributor.types";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// A distributor's listing of a product: its own price and stock.
export interface DistributorProduct {
  id: string;
  price: number;
  stock: number;
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

// The price is kept as an exact decimal string so order amounts are not rounded.
export interface DistributorProductPricing {
  id: string;
  unitPrice: string;
}

import type { ApiResponse } from "../../../../shared/api/types";

export interface DistributorProductItem {
  id: string;
  price: number;
  stock: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    brand: string;
    category: string;
  };
}

export interface DistributorSummary {
  id: string;
  businessName: string;
  contactInfo: string | null;
  locations: Array<{
    city: string;
    address: string;
  }>;
}

export interface DistributorProductDetails extends DistributorProductItem {
  distributor: DistributorSummary;
}

export type DistributorProductsResponse = ApiResponse<{
  products: DistributorProductItem[];
}>;

// distributorProduct is null when no listing has that id.
export type DistributorProductDetailsResponse = ApiResponse<{
  distributorProduct: DistributorProductDetails | null;
}>;

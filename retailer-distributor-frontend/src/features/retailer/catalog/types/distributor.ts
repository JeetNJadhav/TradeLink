export interface DistributorProductItem {
  id: string;
  price: string;
  stock: number;
  product: {
    id: string;
    name: string;
    description?: string;
    brand?: string;
    category?: string;
  };
}

export interface DistributorProductDetails extends DistributorProductItem {
  distributor: {
    id: string;
    businessName: string;
    contactInfo?: string;
    locations?: Array<{
      city?: string;
      address?: string;
    }>;
  };
}

export interface DistributorProductsResponse {
  success: boolean;
  data: {
    products: DistributorProductItem[];
  };
}

export interface DistributorProductDetailsResponse {
  success: boolean;
  data: {
    distributorProduct: DistributorProductDetails;
  };
}

import type { DistributorProductWithProduct } from "../distributorProduct/distributorProduct.types";

export interface DistributorLocation {
  id: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
  retailerId: string | null;
  distributorId: string | null;
}

export interface Distributor {
  id: string;
  businessName: string;
  contactInfo: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributorWithLocations extends Distributor {
  locations: DistributorLocation[];
}

export interface DistributorWithProducts extends DistributorWithLocations {
  distributorProducts: DistributorProductWithProduct[];
}

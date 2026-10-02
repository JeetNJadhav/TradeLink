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

// A distributor as other users see it: without the id of the user who owns it.
export type PublicDistributor = Omit<Distributor, "userId">;

export interface DistributorWithLocations extends PublicDistributor {
  locations: DistributorLocation[];
}

export interface DistributorWithProducts extends DistributorWithLocations {
  distributorProducts: DistributorProductWithProduct[];
}

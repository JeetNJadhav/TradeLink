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
  locations: DistributorLocation[];
}

export interface DistributorProductWithDistributor {
  id: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  distributorId: string;
  productId: string;
  distributor: Distributor;
}

export interface ProductRepository {
  findDistributorsByProductId(
    productId: string,
  ): Promise<DistributorProductWithDistributor[]>;
}

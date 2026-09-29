// distributor.repository.ts

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

export interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface DistributorWithLocations {
  id: string;
  businessName: string;
  contactInfo: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  locations: DistributorLocation[];
}

export interface DistributorWithProducts extends DistributorWithLocations {
  distributorProducts: DistributorProductWithProduct[];
}

export interface DistributorProductWithDetails extends DistributorProductWithProduct {
  distributor: DistributorWithLocations;
}

export interface DistributorRepository {
  getDistributors(): Promise<DistributorWithLocations[]>;

  getDistributorById(id: string): Promise<DistributorWithProducts | null>;

  getDistributorProducts(
    distributorId: string,
  ): Promise<DistributorProductWithProduct[]>;

  getDistributorProductById(
    id: string,
  ): Promise<DistributorProductWithDetails | null>;
}

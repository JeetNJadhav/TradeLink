export interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSearchResult {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  brand?: string;

  distributorId: string;
  distributorName: string;

  price: number;
  stock: number;

  location: {
    lat: number;
    lon: number;
  };

  updatedAt: string;
}

export interface ProductSuggestion {
  productId: string;
  productName: string;
}

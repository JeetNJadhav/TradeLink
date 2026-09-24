export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  distributorId: string;
  items: CreateOrderItem[];
}

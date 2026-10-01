import type { ApiResponse } from "../../../../shared/api/types";

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  distributorId: string;
  items: CreateOrderItem[];
}

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// Amounts are exact decimal strings.
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  orderId: string;
  distributorProductId: string;
}

export interface Order {
  id: string;
  date: string;
  totalAmount: string;
  status: OrderStatus;
  retailerId: string;
  orderItems: OrderItem[];
}

// What is left of a product at the distributor after the order reserved some.
export interface StockLevel {
  productId: string;
  stock: number;
}

export interface PlacedOrder {
  order: Order;
  stockLevels: StockLevel[];
}

export type CreateOrderResponse = ApiResponse<PlacedOrder>;

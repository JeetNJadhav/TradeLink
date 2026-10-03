import type { ApiResponse } from "../../../../shared/api/types";
import type { OrderLineItem, OrderStatus } from "../../../../shared/orders/types";

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  distributorId: string;
  items: CreateOrderItem[];
}

export type { OrderStatus };

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

// ---- The orders the signed-in retailer placed ----

export interface OrderDistributor {
  id: string;
  businessName: string;
}

// One row of the retailer's order list. `distributors` is every distributor
// the order's items were bought from.
export interface RetailerOrderSummary {
  id: string;
  date: string;
  status: OrderStatus;
  totalAmount: string;
  distributors: OrderDistributor[];
  itemCount: number;
}

export interface RetailerOrderItem extends OrderLineItem {
  distributor: OrderDistributor;
}

export interface RetailerOrderDetails {
  id: string;
  date: string;
  status: OrderStatus;
  totalAmount: string;
  // Set only when the order is REJECTED.
  rejectionReason: string | null;
  distributors: OrderDistributor[];
  items: RetailerOrderItem[];
}

export type RetailerOrdersResponse = ApiResponse<{
  orders: RetailerOrderSummary[];
}>;

export type RetailerOrderResponse = ApiResponse<{
  order: RetailerOrderDetails;
}>;

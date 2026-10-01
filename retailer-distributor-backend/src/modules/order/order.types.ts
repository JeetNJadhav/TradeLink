export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  distributorId: string;
  items: CreateOrderItemInput[];
};

// Must stay in sync with the OrderStatus enum in schema.prisma.
export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// Amounts are exact decimal strings, the same form they have in API responses.
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
  distributorProductId: string;
}

export interface Order {
  id: string;
  date: Date;
  totalAmount: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  retailerId: string;
  orderItems: OrderItem[];
}

export interface NewOrderItem {
  distributorProductId: string;
  quantity: number;
  unitPrice: string;
}

export interface NewOrder {
  retailerId: string;
  status: OrderStatus;
  items: NewOrderItem[];
}

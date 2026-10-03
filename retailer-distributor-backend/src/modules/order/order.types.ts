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
  // Set only when the order is REJECTED.
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  retailerId: string;
  orderItems: OrderItem[];
}

// What is left of a product at the distributor after an order reserved some.
export interface StockLevel {
  productId: string;
  stock: number;
}

export interface PlacedOrder {
  order: Order;
  stockLevels: StockLevel[];
}

export interface NewOrderItem {
  distributorProductId: string;
  quantity: number;
  unitPrice: string;
}

export interface NewOrder {
  retailerId: string;
  status: OrderStatus;
  // The exact sum of unitPrice x quantity, from orderTotal in order.money.ts.
  totalAmount: string;
  items: NewOrderItem[];
}

// The stock a listing has left after an order reserved or released some.
export interface ListingStock {
  distributorProductId: string;
  stock: number;
}

// ---- Distributor side: the orders a distributor received ----

export interface OrderRetailer {
  id: string;
  shopName: string;
}

// One row of the distributor's order inbox.
export interface DistributorOrderSummary {
  id: string;
  date: Date;
  status: OrderStatus;
  totalAmount: string;
  retailer: OrderRetailer;
  itemCount: number;
}

export interface DistributorOrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  // unitPrice x quantity, exact.
  lineTotal: string;
  distributorProductId: string;
  product: {
    id: string;
    name: string;
    brand: string;
  };
}

// An order as its distributor sees it. `items` holds only that distributor's items.
export interface DistributorOrderDetails {
  id: string;
  date: Date;
  status: OrderStatus;
  totalAmount: string;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  retailer: OrderRetailer;
  items: DistributorOrderItem[];
}

// ---- Retailer side: the orders a retailer placed ----

export interface OrderDistributor {
  id: string;
  businessName: string;
}

// One row of the retailer's order list. An order has no distributor of its
// own, so `distributors` is every distributor its items were bought from.
export interface RetailerOrderSummary {
  id: string;
  date: Date;
  status: OrderStatus;
  totalAmount: string;
  distributors: OrderDistributor[];
  itemCount: number;
}

export interface RetailerOrderItem extends DistributorOrderItem {
  distributor: OrderDistributor;
}

// An order as the retailer who placed it sees it: every item.
export interface RetailerOrderDetails {
  id: string;
  date: Date;
  status: OrderStatus;
  totalAmount: string;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  distributors: OrderDistributor[];
  items: RetailerOrderItem[];
}

export type RejectOrderInput = {
  reason: string;
};

// A status change that only applies while the order is still in `from` and
// has items from `distributorId`.
export interface OrderStatusChange {
  orderId: string;
  distributorId: string;
  from: OrderStatus;
  to: OrderStatus;
  rejectionReason?: string;
}

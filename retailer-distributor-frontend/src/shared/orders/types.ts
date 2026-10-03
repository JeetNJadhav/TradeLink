// What the retailer and distributor order views have in common.

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// One ordered product. Amounts are exact decimal strings.
export interface OrderLineItem {
  id: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  distributorProductId: string;
  product: {
    id: string;
    name: string;
    brand: string;
  };
}

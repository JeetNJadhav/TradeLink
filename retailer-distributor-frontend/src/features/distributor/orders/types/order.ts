import type { ApiResponse } from "../../../../shared/api/types";
import type { OrderStatus } from "../../../retailer/orders/types/order";

export type { OrderStatus };

export interface OrderRetailer {
  id: string;
  shopName: string;
}

// One row of the distributor's order inbox. Amounts are exact decimal strings.
export interface DistributorOrderSummary {
  id: string;
  date: string;
  status: OrderStatus;
  totalAmount: string;
  retailer: OrderRetailer;
  itemCount: number;
}

export interface DistributorOrderItem {
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

export interface DistributorOrderDetails {
  id: string;
  date: string;
  status: OrderStatus;
  totalAmount: string;
  // Set only when the order is REJECTED.
  rejectionReason: string | null;
  retailer: OrderRetailer;
  items: DistributorOrderItem[];
}

export type DistributorOrdersResponse = ApiResponse<{
  orders: DistributorOrderSummary[];
}>;

export type DistributorOrderResponse = ApiResponse<{
  order: DistributorOrderDetails;
}>;

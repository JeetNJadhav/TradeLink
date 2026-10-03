import type {
  DistributorOrderDetails,
  DistributorOrderSummary,
  NewOrder,
  Order,
  OrderStatus,
  OrderStatusChange,
  RetailerOrderDetails,
  RetailerOrderSummary,
} from "./order.types";

export interface OrderRepository {
  // Stores the order with its items.
  create(order: NewOrder): Promise<Order>;

  // Orders containing items sold by this distributor, newest first.
  findByDistributorId(
    distributorId: string,
    status?: OrderStatus,
  ): Promise<DistributorOrderSummary[]>;

  // Null when the order does not exist or has no items from this distributor.
  findDetailsForDistributor(
    orderId: string,
    distributorId: string,
  ): Promise<DistributorOrderDetails | null>;

  // Orders placed by this retailer, newest first.
  findByRetailerId(
    retailerId: string,
    status?: OrderStatus,
  ): Promise<RetailerOrderSummary[]>;

  // Null when the order does not exist or was placed by another retailer.
  findDetailsForRetailer(
    orderId: string,
    retailerId: string,
  ): Promise<RetailerOrderDetails | null>;

  // Applies the change only if the order is still in `from`. Returns false when
  // nothing was updated, e.g. another request changed the status first.
  updateStatus(change: OrderStatusChange): Promise<boolean>;
}

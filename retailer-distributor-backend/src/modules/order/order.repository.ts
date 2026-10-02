import type {
  DistributorOrderDetails,
  DistributorOrderSummary,
  NewOrder,
  Order,
  OrderStatus,
  OrderStatusChange,
} from "./order.types";

export interface OrderRepository {
  // Stores the order with its items. totalAmount is the exact sum of unitPrice x quantity.
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

  // Applies the change only if the order is still in `from`. Returns false when
  // nothing was updated, e.g. another request changed the status first.
  updateStatus(change: OrderStatusChange): Promise<boolean>;
}

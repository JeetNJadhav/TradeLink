import type { NewOrder, Order } from "./order.types";

export interface OrderRepository {
  // Stores the order with its items. totalAmount is the exact sum of unitPrice x quantity.
  create(order: NewOrder): Promise<Order>;
}

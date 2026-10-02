import type { OrderStatus } from "./order.types";

// The only place that says which status an order may move to next.
// A status with an empty list is final.
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  REJECTED: [],
  DELIVERED: [],
  CANCELLED: [],
};

export const ORDER_STATUSES = Object.keys(ORDER_TRANSITIONS) as OrderStatus[];

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  ORDER_TRANSITIONS[from].includes(to);

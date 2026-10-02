import type { OrderStatus } from "../types/order";

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`order-status-badge is-${status.toLowerCase()}`}>
    {status}
  </span>
);

export default OrderStatusBadge;

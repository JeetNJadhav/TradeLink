import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import BackButton from "../../../../shared/components/BackButton";
import { ROLE_HOME } from "../../../auth/roleRoutes";
import OrderStatusBadge from "../components/OrderStatusBadge";
import useDistributorOrders from "../hooks/useDistributorOrders";
import { formatOrderDate, shortOrderId } from "../orderFormat";
import type { OrderStatus } from "../types/order";

// `status: undefined` shows every order.
const FILTERS: { label: string; status: OrderStatus | undefined }[] = [
  { label: "All", status: undefined },
  { label: "Pending", status: "PENDING" },
  { label: "Accepted", status: "ACCEPTED" },
  { label: "Rejected", status: "REJECTED" },
];

const DistributorOrders = () => {
  const [status, setStatus] = useState<OrderStatus | undefined>("PENDING");
  const { orders, loading, error } = useDistributorOrders(status);

  let content: ReactNode;

  if (loading) {
    content = <div className="distributor-status">Loading orders...</div>;
  } else if (error) {
    content = <div className="distributor-error">{error.message}</div>;
  } else if (orders.length === 0) {
    content = (
      <div className="distributor-empty">
        <h3>No orders here</h3>
        <p>Orders placed by retailers will show up in this list.</p>
      </div>
    );
  } else {
    content = (
      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              className="orders-row card-link"
              to={`/distributor/orders/${order.id}`}
            >
              <span className="orders-row-main">
                <strong>{shortOrderId(order.id)}</strong>
                <span>{formatOrderDate(order.date)}</span>
              </span>

              <span>{order.retailer.shopName}</span>

              <span>
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              </span>

              <span className="orders-row-total">₹{order.totalAmount}</span>

              <OrderStatusBadge status={order.status} />
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="orders-page">
      <BackButton fallback={ROLE_HOME.DISTRIBUTOR} />

      <div className="distributor-header">
        <h1>Orders</h1>
        <p>Orders retailers have placed with you</p>
      </div>

      <div className="orders-filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            className="orders-filter"
            type="button"
            aria-pressed={filter.status === status}
            onClick={() => setStatus(filter.status)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {content}
    </div>
  );
};

export default DistributorOrders;

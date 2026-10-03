import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import BackButton from "../../../../shared/components/BackButton";
import OrderStatusBadge from "../../../../shared/orders/OrderStatusBadge";
import OrderStatusFilters from "../../../../shared/orders/OrderStatusFilters";
import {
  formatOrderDate,
  shortOrderId,
} from "../../../../shared/orders/orderFormat";
import { RETAILER_ORDERS_PATH, ROLE_HOME } from "../../../auth/roleRoutes";
import useRetailerOrders from "../hooks/useRetailerOrders";
import { distributorNames } from "../orderDistributors";
import type { OrderStatus } from "../types/order";

const RetailerOrders = () => {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const { orders, loading, error } = useRetailerOrders(status);

  let content: ReactNode;

  if (loading) {
    content = <div className="distributor-status">Loading orders...</div>;
  } else if (error) {
    content = <div className="distributor-error">{error.message}</div>;
  } else if (orders.length === 0) {
    content = (
      <div className="distributor-empty">
        <h3>No orders here</h3>
        <p>Orders you place with distributors will show up in this list.</p>
      </div>
    );
  } else {
    content = (
      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              className="orders-row card-link"
              to={`${RETAILER_ORDERS_PATH}/${order.id}`}
            >
              <span className="orders-row-main">
                <strong>{shortOrderId(order.id)}</strong>
                <span>{formatOrderDate(order.date)}</span>
              </span>

              <span>{distributorNames(order.distributors)}</span>

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
      <BackButton fallback={ROLE_HOME.RETAILER} />

      <div className="distributor-header">
        <h1>Orders</h1>
        <p>Orders you have placed with distributors</p>
      </div>

      <OrderStatusFilters status={status} onChange={setStatus} />

      {content}
    </div>
  );
};

export default RetailerOrders;

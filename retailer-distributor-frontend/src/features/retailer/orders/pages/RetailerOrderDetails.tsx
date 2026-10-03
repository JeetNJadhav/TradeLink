import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../../../shared/components/BackButton";
import OrderItemsTable from "../../../../shared/orders/OrderItemsTable";
import OrderStatusBadge from "../../../../shared/orders/OrderStatusBadge";
import {
  formatOrderDate,
  shortOrderId,
} from "../../../../shared/orders/orderFormat";
import { RETAILER_ORDERS_PATH } from "../../../auth/roleRoutes";
import useRetailerOrder from "../hooks/useRetailerOrder";
import { distributorNames } from "../orderDistributors";

const RetailerOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, loading, error } = useRetailerOrder(orderId);

  let content: ReactNode;

  if (loading) {
    content = <div className="distributor-status">Loading order...</div>;
  } else if (error) {
    content = <div className="distributor-error">{error.message}</div>;
  } else if (!order) {
    content = <div className="distributor-status">Order not found.</div>;
  } else {
    content = (
      <>
        <div className="order-details-header">
          <div>
            <h1>Order {shortOrderId(order.id)}</h1>
            <p>
              {distributorNames(order.distributors)} ·{" "}
              {formatOrderDate(order.date)}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />

        {order.rejectionReason && (
          <div className="order-rejection">
            <span className="label">Rejection reason</span>
            <p>{order.rejectionReason}</p>
          </div>
        )}
      </>
    );
  }

  // The back button sits outside `content` so every state has a way out.
  return (
    <div className="orders-page">
      <BackButton fallback={RETAILER_ORDERS_PATH} />

      {content}
    </div>
  );
};

export default RetailerOrderDetails;

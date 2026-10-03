import { useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../../../shared/components/BackButton";
import OrderItemsTable from "../../../../shared/orders/OrderItemsTable";
import OrderStatusBadge from "../../../../shared/orders/OrderStatusBadge";
import {
  formatOrderDate,
  shortOrderId,
} from "../../../../shared/orders/orderFormat";
import { ROLE_HOME } from "../../../auth/roleRoutes";
import RejectOrderForm from "../components/RejectOrderForm";
import useDistributorOrder from "../hooks/useDistributorOrder";
import useOrderDecision from "../hooks/useOrderDecision";

const DistributorOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, loading, error, reload } = useDistributorOrder(orderId);
  const decision = useOrderDecision(orderId);
  const [rejecting, setRejecting] = useState(false);

  // Reload even when the decision failed: the usual cause is that the order
  // is no longer pending, and the page should show that.
  const handleAccept = async () => {
    await decision.accept();
    reload();
  };

  const handleReject = async (reason: string) => {
    const rejected = await decision.reject(reason);
    if (rejected) setRejecting(false);
    reload();
  };

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
              {order.retailer.shopName} · {formatOrderDate(order.date)}
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

        {order.status === "PENDING" &&
          (rejecting ? (
            <RejectOrderForm
              submitting={decision.submitting}
              onSubmit={(reason) => void handleReject(reason)}
              onCancel={() => setRejecting(false)}
            />
          ) : (
            <div className="order-actions">
              <button
                className="order-action-button is-primary"
                type="button"
                disabled={decision.submitting}
                onClick={() => void handleAccept()}
              >
                {decision.submitting ? "Accepting..." : "Accept Order"}
              </button>

              <button
                className="order-action-button is-danger"
                type="button"
                disabled={decision.submitting}
                onClick={() => setRejecting(true)}
              >
                Reject Order
              </button>
            </div>
          ))}

        {decision.error && (
          <p className="order-error" role="alert">
            {decision.error}
          </p>
        )}
      </>
    );
  }

  // The back button sits outside `content` so every state has a way out.
  return (
    <div className="orders-page">
      <BackButton fallback={ROLE_HOME.DISTRIBUTOR} />

      {content}
    </div>
  );
};

export default DistributorOrderDetails;

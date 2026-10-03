import { OrderError } from "./order.errors";
import { resolveRetailerId } from "./order.retailer";
import type {
  OrderStatus,
  RetailerOrderDetails,
  RetailerOrderSummary,
} from "./order.types";
import type { OrderUnitOfWork } from "./order.unitOfWork";

// Lets a retailer look at the orders they placed. Only reads.
export class RetailerOrderService {
  constructor(private readonly unitOfWork: Pick<OrderUnitOfWork, "read">) {}

  listOrders(
    userId: string,
    status?: OrderStatus,
  ): Promise<RetailerOrderSummary[]> {
    return this.unitOfWork.read(async (repositories) => {
      const retailerId = await resolveRetailerId(repositories, userId);

      return repositories.orders.findByRetailerId(retailerId, status);
    });
  }

  // An order of another retailer is reported as missing, so ids do not leak.
  getOrder(userId: string, orderId: string): Promise<RetailerOrderDetails> {
    return this.unitOfWork.read(async (repositories) => {
      const retailerId = await resolveRetailerId(repositories, userId);
      const order = await repositories.orders.findDetailsForRetailer(
        orderId,
        retailerId,
      );

      if (!order) {
        throw new OrderError("Order not found", 404);
      }

      return order;
    });
  }
}

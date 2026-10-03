import { OrderError } from "./order.errors";
import { canTransition } from "./order.transitions";
import { syncListingStock, type StockIndex } from "./order.stockIndex";
import type {
  DistributorOrderDetails,
  DistributorOrderSummary,
  ListingStock,
  OrderStatus,
} from "./order.types";
import type { OrderTransaction, OrderUnitOfWork } from "./order.unitOfWork";

type OrderDecision = {
  to: Extract<OrderStatus, "ACCEPTED" | "REJECTED">;
  rejectionReason?: string;
};

// What a distributor can do with the orders placed with them.
export class DistributorOrderService {
  constructor(
    private readonly unitOfWork: OrderUnitOfWork,
    private readonly stockIndex: StockIndex,
  ) {}

  listOrders(
    userId: string,
    status?: OrderStatus,
  ): Promise<DistributorOrderSummary[]> {
    return this.unitOfWork.read(async (repositories) => {
      const distributorId = await this.resolveDistributorId(
        repositories,
        userId,
      );

      return repositories.orders.findByDistributorId(distributorId, status);
    });
  }

  getOrder(userId: string, orderId: string): Promise<DistributorOrderDetails> {
    return this.unitOfWork.read(async (repositories) => {
      const distributorId = await this.resolveDistributorId(
        repositories,
        userId,
      );

      return this.findOrder(repositories, orderId, distributorId);
    });
  }

  acceptOrder(
    userId: string,
    orderId: string,
  ): Promise<DistributorOrderDetails> {
    return this.decide(userId, orderId, { to: "ACCEPTED" });
  }

  // Stock was reserved when the order was placed, so a rejection gives it back.
  rejectOrder(
    userId: string,
    orderId: string,
    reason: string,
  ): Promise<DistributorOrderDetails> {
    return this.decide(userId, orderId, {
      to: "REJECTED",
      rejectionReason: reason,
    });
  }

  private async decide(
    userId: string,
    orderId: string,
    decision: OrderDecision,
  ): Promise<DistributorOrderDetails> {
    const { order, released } = await this.unitOfWork.run(async (transaction) => {
      const distributorId = await this.resolveDistributorId(
        transaction,
        userId,
      );
      const order = await this.findOrder(transaction, orderId, distributorId);

      if (!canTransition(order.status, decision.to)) {
        throw new OrderError(
          `Order is ${order.status} and cannot be changed to ${decision.to}`,
          409,
        );
      }

      const updated = await transaction.orders.updateStatus({
        orderId,
        distributorId,
        from: order.status,
        to: decision.to,
        rejectionReason: decision.rejectionReason,
      });

      if (!updated) {
        throw new OrderError(
          "Order was changed by another request. Reload and try again",
          409,
        );
      }

      const released: ListingStock[] = [];

      if (decision.to === "REJECTED") {
        for (const item of order.items) {
          released.push({
            distributorProductId: item.distributorProductId,
            stock: await transaction.distributorProducts.releaseStock(
              item.distributorProductId,
              item.quantity,
            ),
          });
        }
      }

      return {
        order: await this.findOrder(transaction, orderId, distributorId),
        released,
      };
    });

    await syncListingStock(this.stockIndex, released);

    return order;
  }

  // The authenticated user's id is User.id; orders are matched against their Distributor profile.
  private async resolveDistributorId(
    transaction: OrderTransaction,
    userId: string,
  ): Promise<string> {
    const distributor = await transaction.distributors.findByUserId(userId);

    if (!distributor) {
      throw new OrderError("Distributor not found", 404);
    }

    return distributor.id;
  }

  // An order of another distributor is reported as missing, so ids do not leak.
  private async findOrder(
    transaction: OrderTransaction,
    orderId: string,
    distributorId: string,
  ): Promise<DistributorOrderDetails> {
    const order = await transaction.orders.findDetailsForDistributor(
      orderId,
      distributorId,
    );

    if (!order) {
      throw new OrderError("Order not found", 404);
    }

    return order;
  }
}

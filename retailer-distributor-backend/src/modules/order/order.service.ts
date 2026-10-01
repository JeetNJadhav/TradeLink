import { OrderError } from "./order.errors";
import type {
  CreateOrderInput,
  NewOrderItem,
  PlacedOrder,
  StockLevel,
} from "./order.types";
import type { OrderUnitOfWork } from "./order.unitOfWork";

export class OrderService {
  constructor(private readonly unitOfWork: OrderUnitOfWork) {}

  async createOrder(
    userId: string,
    input: CreateOrderInput,
  ): Promise<PlacedOrder> {
    const productIds = input.items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new OrderError(
        "Duplicate products are not allowed in an order",
        400,
      );
    }

    return this.unitOfWork.run(
      async ({ orders, retailers, distributors, distributorProducts }) => {
        // The authenticated user's id is User.id; the order belongs to their Retailer profile.
        const retailer = await retailers.findByUserId(userId);

        if (!retailer) {
          throw new OrderError("Retailer not found", 404);
        }

        if (!(await distributors.exists(input.distributorId))) {
          throw new OrderError("Distributor not found", 404);
        }

        const items: NewOrderItem[] = [];

        for (const item of input.items) {
          const pricing = await distributorProducts.findPricing(
            input.distributorId,
            item.productId,
          );

          if (!pricing) {
            throw new OrderError(
              `Distributor does not sell product ${item.productId}`,
              400,
            );
          }

          items.push({
            distributorProductId: pricing.id,
            quantity: item.quantity,
            unitPrice: pricing.unitPrice,
          });
        }

        const order = await orders.create({
          retailerId: retailer.id,
          status: "PENDING",
          items,
        });

        const stockLevels: StockLevel[] = [];

        for (const item of input.items) {
          const remaining = await distributorProducts.reserveStock(
            input.distributorId,
            item.productId,
            item.quantity,
          );

          if (remaining === null) {
            throw new OrderError(
              `Insufficient stock for product ${item.productId}`,
              409,
            );
          }

          stockLevels.push({ productId: item.productId, stock: remaining });
        }

        return { order, stockLevels };
      },
    );
  }
}

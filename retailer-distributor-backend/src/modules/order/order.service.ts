import { OrderError } from "./order.errors";
import { orderTotal } from "./order.money";
import { resolveRetailerId } from "./order.retailer";
import { syncListingStock, type StockIndex } from "./order.stockIndex";
import type {
  CreateOrderInput,
  ListingStock,
  PlacedOrder,
  StockLevel,
} from "./order.types";
import type { OrderTransaction, OrderUnitOfWork } from "./order.unitOfWork";

// An ordered product matched to the distributor's listing and its price.
interface PricedItem {
  productId: string;
  distributorProductId: string;
  quantity: number;
  unitPrice: string;
}

// What is left of a listing after its stock was reserved.
interface Reservation extends ListingStock {
  productId: string;
}

const assertNoDuplicateProducts = (input: CreateOrderInput): void => {
  const productIds = input.items.map((item) => item.productId);

  if (new Set(productIds).size !== productIds.length) {
    throw new OrderError("Duplicate products are not allowed in an order", 400);
  }
};

export class OrderService {
  constructor(
    private readonly unitOfWork: OrderUnitOfWork,
    private readonly stockIndex: StockIndex,
  ) {}

  async createOrder(
    userId: string,
    input: CreateOrderInput,
  ): Promise<PlacedOrder> {
    assertNoDuplicateProducts(input);

    const { placed, reservations } = await this.unitOfWork.run(
      async (transaction) => {
        const retailerId = await resolveRetailerId(transaction, userId);

        if (!(await transaction.distributors.exists(input.distributorId))) {
          throw new OrderError("Distributor not found", 404);
        }

        const items = await this.priceItems(transaction, input);

        const order = await transaction.orders.create({
          retailerId,
          status: "PENDING",
          totalAmount: orderTotal(items),
          items: items.map(({ distributorProductId, quantity, unitPrice }) => ({
            distributorProductId,
            quantity,
            unitPrice,
          })),
        });

        const reservations = await this.reserveStock(
          transaction,
          input.distributorId,
          items,
        );

        const stockLevels: StockLevel[] = reservations.map(
          ({ productId, stock }) => ({ productId, stock }),
        );

        return { placed: { order, stockLevels }, reservations };
      },
    );

    await syncListingStock(this.stockIndex, reservations);

    return placed;
  }

  // Prices come from the distributor's listings, never from the request.
  private async priceItems(
    transaction: OrderTransaction,
    input: CreateOrderInput,
  ): Promise<PricedItem[]> {
    const items: PricedItem[] = [];

    for (const item of input.items) {
      const pricing = await transaction.distributorProducts.findPricing(
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
        productId: item.productId,
        distributorProductId: pricing.id,
        quantity: item.quantity,
        unitPrice: pricing.unitPrice,
      });
    }

    return items;
  }

  // Throws when a listing has too little stock, which rolls the order back.
  private async reserveStock(
    transaction: OrderTransaction,
    distributorId: string,
    items: PricedItem[],
  ): Promise<Reservation[]> {
    const reservations: Reservation[] = [];

    // Stock rows are locked in the same order by every order, so two
    // orders for the same products cannot deadlock each other.
    const inLockOrder = [...items].sort((a, b) =>
      a.productId < b.productId ? -1 : 1,
    );

    for (const item of inLockOrder) {
      const remaining = await transaction.distributorProducts.reserveStock(
        distributorId,
        item.productId,
        item.quantity,
      );

      if (remaining === null) {
        throw new OrderError(
          `Insufficient stock for product ${item.productId}`,
          409,
        );
      }

      reservations.push({
        productId: item.productId,
        distributorProductId: item.distributorProductId,
        stock: remaining,
      });
    }

    return reservations;
  }
}

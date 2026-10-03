import { beforeEach, describe, expect, it } from "vitest";
import { DistributorOrderService } from "../src/modules/order/distributorOrder.service";
import { OrderService } from "../src/modules/order/order.service";
import type { OrderTransaction } from "../src/modules/order/order.unitOfWork";
import {
  createOrderState,
  DISTRIBUTOR_USER_ID,
  InMemoryOrderUnitOfWork,
  OTHER_DISTRIBUTOR_USER_ID,
  RecordingStockIndex,
  RETAILER_USER_ID,
} from "./support/inMemoryOrderUnitOfWork";

// Behaves as if another request changed the order's status first.
class LostRaceUnitOfWork extends InMemoryOrderUnitOfWork {
  protected transaction(): OrderTransaction {
    const transaction = super.transaction();

    return {
      ...transaction,
      orders: { ...transaction.orders, updateStatus: async () => false },
    };
  }
}

describe("DistributorOrderService", () => {
  let unitOfWork: InMemoryOrderUnitOfWork;
  let stockIndex: RecordingStockIndex;
  let service: DistributorOrderService;
  let orderId: string;

  const stockOf = (listingId: string) =>
    unitOfWork.state.listings.find((listing) => listing.id === listingId)!
      .stock;

  // Leaves a pending order for 3 of product A: stock goes from 10 to 7.
  const placeOrder = async (target: InMemoryOrderUnitOfWork) => {
    const placed = await new OrderService(
      target,
      new RecordingStockIndex(),
    ).createOrder(
      RETAILER_USER_ID,
      {
        distributorId: "distributor-1",
        items: [{ productId: "product-a", quantity: 3 }],
      },
    );

    return placed.order.id;
  };

  beforeEach(async () => {
    unitOfWork = new InMemoryOrderUnitOfWork(createOrderState());
    stockIndex = new RecordingStockIndex();
    service = new DistributorOrderService(unitOfWork, stockIndex);
    orderId = await placeOrder(unitOfWork);
  });

  it("lists the orders placed with the distributor", async () => {
    const orders = await service.listOrders(DISTRIBUTOR_USER_ID);

    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      id: orderId,
      status: "PENDING",
      itemCount: 1,
    });
    expect(await service.listOrders(DISTRIBUTOR_USER_ID, "ACCEPTED")).toEqual(
      [],
    );
    expect(await service.listOrders(OTHER_DISTRIBUTOR_USER_ID)).toEqual([]);
  });

  it("accepts a pending order and keeps the stock reserved", async () => {
    const order = await service.acceptOrder(DISTRIBUTOR_USER_ID, orderId);

    expect(order.status).toBe("ACCEPTED");
    expect(order.rejectionReason).toBeNull();
    expect(stockOf("listing-a")).toBe(7);
    expect(stockIndex.updates).toEqual([]);
  });

  it("rejects a pending order, stores the reason and releases the stock", async () => {
    const order = await service.rejectOrder(
      DISTRIBUTOR_USER_ID,
      orderId,
      "Out of delivery range",
    );

    expect(order.status).toBe("REJECTED");
    expect(order.rejectionReason).toBe("Out of delivery range");
    expect(stockOf("listing-a")).toBe(10);
    expect(stockIndex.updates).toEqual([
      { distributorProductId: "listing-a", stock: 10 },
    ]);
  });

  it("does not allow a second decision on the same order", async () => {
    await service.rejectOrder(DISTRIBUTOR_USER_ID, orderId, "No stock");

    await expect(
      service.acceptOrder(DISTRIBUTOR_USER_ID, orderId),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(stockOf("listing-a")).toBe(10);
  });

  it("reports another distributor's order as missing", async () => {
    await expect(
      service.getOrder(OTHER_DISTRIBUTOR_USER_ID, orderId),
    ).rejects.toMatchObject({ statusCode: 404, message: "Order not found" });

    await expect(
      service.acceptOrder(OTHER_DISTRIBUTOR_USER_ID, orderId),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(unitOfWork.state.orders[0].status).toBe("PENDING");
  });

  it("fails when the user has no distributor profile", async () => {
    await expect(
      service.listOrders(RETAILER_USER_ID),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Distributor not found",
    });
  });

  it("releases no stock when another request changed the order first", async () => {
    const racing = new LostRaceUnitOfWork(createOrderState());
    const racingOrderId = await placeOrder(racing);

    await expect(
      new DistributorOrderService(racing, stockIndex).rejectOrder(
        DISTRIBUTOR_USER_ID,
        racingOrderId,
        "No stock",
      ),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(racing.state.listings[0].stock).toBe(7);
    expect(stockIndex.updates).toEqual([]);
    expect(racing.state.orders[0].status).toBe("PENDING");
  });
});

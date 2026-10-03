import { beforeEach, describe, expect, it } from "vitest";
import { DistributorOrderService } from "../src/modules/order/distributorOrder.service";
import { OrderService } from "../src/modules/order/order.service";
import { RetailerOrderService } from "../src/modules/order/retailerOrder.service";
import {
  createOrderState,
  DISTRIBUTOR_USER_ID,
  InMemoryOrderUnitOfWork,
  OTHER_RETAILER_USER_ID,
  RecordingStockIndex,
  RETAILER_USER_ID,
} from "./support/inMemoryOrderUnitOfWork";

describe("RetailerOrderService", () => {
  let unitOfWork: InMemoryOrderUnitOfWork;
  let service: RetailerOrderService;
  let orderId: string;

  // 3 of product A at 10.50 and 1 of product B at 4.00, from distributor 1.
  const placeOrder = async (userId: string) => {
    const placed = await new OrderService(
      unitOfWork,
      new RecordingStockIndex(),
    ).createOrder(userId, {
      distributorId: "distributor-1",
      items: [
        { productId: "product-a", quantity: 3 },
        { productId: "product-b", quantity: 1 },
      ],
    });

    return placed.order.id;
  };

  beforeEach(async () => {
    unitOfWork = new InMemoryOrderUnitOfWork(createOrderState());
    service = new RetailerOrderService(unitOfWork);
    orderId = await placeOrder(RETAILER_USER_ID);
  });

  it("lists only the orders the retailer placed", async () => {
    const otherOrderId = await placeOrder(OTHER_RETAILER_USER_ID);

    const orders = await service.listOrders(RETAILER_USER_ID);

    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      id: orderId,
      status: "PENDING",
      totalAmount: "35.5",
      itemCount: 2,
      distributors: [{ id: "distributor-1", businessName: "Wholesale One" }],
    });

    const otherOrders = await service.listOrders(OTHER_RETAILER_USER_ID);

    expect(otherOrders.map((order) => order.id)).toEqual([otherOrderId]);
  });

  it("filters the list by status", async () => {
    expect(await service.listOrders(RETAILER_USER_ID, "REJECTED")).toEqual([]);

    await new DistributorOrderService(
      unitOfWork,
      new RecordingStockIndex(),
    ).rejectOrder(DISTRIBUTOR_USER_ID, orderId, "Out of delivery range");

    const rejected = await service.listOrders(RETAILER_USER_ID, "REJECTED");

    expect(rejected.map((order) => order.id)).toEqual([orderId]);
    expect(await service.listOrders(RETAILER_USER_ID, "PENDING")).toEqual([]);
  });

  it("returns an order with its items, line totals and distributor", async () => {
    const order = await service.getOrder(RETAILER_USER_ID, orderId);

    expect(order).toMatchObject({
      id: orderId,
      status: "PENDING",
      totalAmount: "35.5",
      rejectionReason: null,
      distributors: [{ id: "distributor-1", businessName: "Wholesale One" }],
    });
    expect(order.items).toHaveLength(2);
    expect(order.items[0]).toMatchObject({
      quantity: 3,
      unitPrice: "10.50",
      lineTotal: "31.5",
      distributorProductId: "listing-a",
      distributor: { id: "distributor-1", businessName: "Wholesale One" },
    });
  });

  it("shows the reason when the distributor rejected the order", async () => {
    await new DistributorOrderService(
      unitOfWork,
      new RecordingStockIndex(),
    ).rejectOrder(DISTRIBUTOR_USER_ID, orderId, "Out of delivery range");

    const order = await service.getOrder(RETAILER_USER_ID, orderId);

    expect(order.status).toBe("REJECTED");
    expect(order.rejectionReason).toBe("Out of delivery range");
  });

  it("reports another retailer's order as missing", async () => {
    await expect(
      service.getOrder(OTHER_RETAILER_USER_ID, orderId),
    ).rejects.toMatchObject({ statusCode: 404, message: "Order not found" });
  });

  it("fails when the user has no retailer profile", async () => {
    await expect(
      service.listOrders(DISTRIBUTOR_USER_ID),
    ).rejects.toMatchObject({ statusCode: 404, message: "Retailer not found" });

    await expect(
      service.getOrder(DISTRIBUTOR_USER_ID, orderId),
    ).rejects.toMatchObject({ statusCode: 404, message: "Retailer not found" });
  });
});

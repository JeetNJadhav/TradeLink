import { beforeEach, describe, expect, it } from "vitest";
import { OrderService } from "../src/modules/order/order.service";
import {
  createOrderState,
  InMemoryOrderUnitOfWork,
  RETAILER_USER_ID,
} from "./support/inMemoryOrderUnitOfWork";

describe("OrderService.createOrder", () => {
  let unitOfWork: InMemoryOrderUnitOfWork;
  let service: OrderService;

  const stockOf = (listingId: string) =>
    unitOfWork.state.listings.find((listing) => listing.id === listingId)!
      .stock;

  beforeEach(() => {
    unitOfWork = new InMemoryOrderUnitOfWork(createOrderState());
    service = new OrderService(unitOfWork);
  });

  it("places a pending order and reserves the stock", async () => {
    const placed = await service.createOrder(RETAILER_USER_ID, {
      distributorId: "distributor-1",
      items: [
        { productId: "product-a", quantity: 3 },
        { productId: "product-b", quantity: 2 },
      ],
    });

    expect(placed.order.status).toBe("PENDING");
    expect(placed.order.retailerId).toBe("retailer-1");
    expect(placed.order.orderItems).toHaveLength(2);
    expect(placed.order.orderItems[0]).toMatchObject({
      distributorProductId: "listing-a",
      quantity: 3,
      unitPrice: "10.50",
    });
    expect(placed.stockLevels).toEqual([
      { productId: "product-a", stock: 7 },
      { productId: "product-b", stock: 0 },
    ]);
    expect(stockOf("listing-a")).toBe(7);
    expect(stockOf("listing-b")).toBe(0);
    expect(unitOfWork.state.orders).toHaveLength(1);
  });

  it("rejects an order that lists the same product twice", async () => {
    await expect(
      service.createOrder(RETAILER_USER_ID, {
        distributorId: "distributor-1",
        items: [
          { productId: "product-a", quantity: 1 },
          { productId: "product-a", quantity: 2 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(unitOfWork.state.orders).toHaveLength(0);
  });

  it("fails when the user has no retailer profile", async () => {
    await expect(
      service.createOrder("user-unknown", {
        distributorId: "distributor-1",
        items: [{ productId: "product-a", quantity: 1 }],
      }),
    ).rejects.toMatchObject({ statusCode: 404, message: "Retailer not found" });
  });

  it("fails when the distributor does not exist", async () => {
    await expect(
      service.createOrder(RETAILER_USER_ID, {
        distributorId: "distributor-unknown",
        items: [{ productId: "product-a", quantity: 1 }],
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Distributor not found",
    });
  });

  it("fails when the distributor does not sell a product", async () => {
    await expect(
      service.createOrder(RETAILER_USER_ID, {
        distributorId: "distributor-1",
        items: [{ productId: "product-unknown", quantity: 1 }],
      }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(unitOfWork.state.orders).toHaveLength(0);
  });

  it("rolls back the order and earlier reservations when stock runs out", async () => {
    await expect(
      service.createOrder(RETAILER_USER_ID, {
        distributorId: "distributor-1",
        items: [
          { productId: "product-a", quantity: 3 },
          { productId: "product-b", quantity: 5 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(unitOfWork.state.orders).toHaveLength(0);
    expect(stockOf("listing-a")).toBe(10);
    expect(stockOf("listing-b")).toBe(2);
  });
});

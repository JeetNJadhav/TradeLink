import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  distributorId: string;
  items: CreateOrderItemInput[];
};

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

const getDevelopmentRetailerId = (): string => {
  const retailerId = process.env.DEV_RETAILER_ID;

  if (!retailerId) {
    throw new OrderError("DEV_RETAILER_ID is not configured", 500);
  }

  // TEMPORARY MVP DEVELOPMENT CONTEXT:
  // Authentication/authorization is intentionally not implemented in Step 1.
  // After auth is implemented, replace this with the authenticated retailer's
  // identity from the request/auth context. Do not accept retailerId from the
  // frontend request body.
  return retailerId;
};

export const createOrder = async (input: CreateOrderInput) => {
  const retailerId = getDevelopmentRetailerId();

  if (input.items.length === 0) {
    throw new OrderError("At least one order item is required", 400);
  }

  const productIds = input.items.map((item) => item.productId);
  if (new Set(productIds).size !== productIds.length) {
    throw new OrderError("Duplicate products are not allowed in an order", 400);
  }

  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new OrderError("Quantity must be a positive integer", 400);
    }
  }

  return prisma.$transaction(async (tx) => {
    const retailer = await tx.retailer.findUnique({
      where: { id: retailerId },
    });

    if (!retailer) {
      throw new OrderError("Retailer not found", 404);
    }

    const distributor = await tx.distributor.findUnique({
      where: { id: input.distributorId },
    });

    if (!distributor) {
      throw new OrderError("Distributor not found", 404);
    }

    const orderItems = [];
    let totalAmount = new Prisma.Decimal(0);

    for (const item of input.items) {
      const distributorProduct = await tx.distributorProduct.findUnique({
        where: {
          distributorId_productId: {
            distributorId: input.distributorId,
            productId: item.productId,
          },
        },
        include: {
          product: true,
        },
      });

      if (!distributorProduct) {
        throw new OrderError(
          `Distributor does not sell product ${item.productId}`,
          400,
        );
      }

      const itemTotal = distributorProduct.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      orderItems.push({
        distributorProductId: distributorProduct.id,
        quantity: item.quantity,
        unitPrice: distributorProduct.price,
      });
    }

    const order = await tx.order.create({
      data: {
        retailerId,
        totalAmount,
        status: "PENDING",
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // The stock update is conditional: PostgreSQL updates the row only when
    // enough stock remains. This prevents two concurrent orders from both
    // successfully reserving the same inventory.
    for (const item of input.items) {
      const updated = await tx.distributorProduct.updateMany({
        where: {
          distributorId: input.distributorId,
          productId: item.productId,
          stock: {
            gte: item.quantity,
          },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (updated.count !== 1) {
        throw new OrderError(
          `Insufficient stock for product ${item.productId}`,
          409,
        );
      }
    }

    return order;
  });
};

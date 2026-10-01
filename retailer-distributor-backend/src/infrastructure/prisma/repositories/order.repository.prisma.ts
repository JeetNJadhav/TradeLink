import { Prisma } from "../../../generated/prisma/client";
import type { PrismaDb } from "../prisma.client";
import type { OrderRepository } from "../../../modules/order/order.repository";
import type { NewOrder, Order } from "../../../modules/order/order.types";

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaDb) {}

  async create(order: NewOrder): Promise<Order> {
    const totalAmount = order.items.reduce(
      (total, item) =>
        total.add(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
      new Prisma.Decimal(0),
    );

    const created = await this.prisma.order.create({
      data: {
        retailerId: order.retailerId,
        totalAmount,
        status: order.status,
        orderItems: {
          create: order.items,
        },
      },
      include: {
        orderItems: true,
      },
    });

    return {
      ...created,
      totalAmount: created.totalAmount.toString(),
      orderItems: created.orderItems.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
      })),
    };
  }
}

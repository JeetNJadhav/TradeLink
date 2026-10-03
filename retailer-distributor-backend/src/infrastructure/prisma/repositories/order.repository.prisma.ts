import type { Prisma } from "../../../generated/prisma/client";
import type { PrismaDb } from "../prisma.client";
import { lineTotal } from "../../../modules/order/order.money";
import type { OrderRepository } from "../../../modules/order/order.repository";
import type {
  DistributorOrderDetails,
  DistributorOrderSummary,
  NewOrder,
  Order,
  OrderStatus,
  OrderStatusChange,
} from "../../../modules/order/order.types";

// Order has no distributor column: an order belongs to a distributor through
// the listings its items point at. Every distributor check goes through here.
const itemsSoldBy = (distributorId: string): Prisma.OrderItemWhereInput => ({
  distributorProduct: { distributorId },
});

const soldBy = (distributorId: string): Prisma.OrderWhereInput => ({
  orderItems: { some: itemsSoldBy(distributorId) },
});

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaDb) {}

  async create(order: NewOrder): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        retailerId: order.retailerId,
        totalAmount: order.totalAmount,
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

  async findByDistributorId(
    distributorId: string,
    status?: OrderStatus,
  ): Promise<DistributorOrderSummary[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        ...soldBy(distributorId),
        status,
      },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        status: true,
        totalAmount: true,
        retailer: {
          select: { id: true, shopName: true },
        },
        _count: {
          select: {
            orderItems: { where: itemsSoldBy(distributorId) },
          },
        },
      },
    });

    return orders.map(({ _count, totalAmount, ...order }) => ({
      ...order,
      totalAmount: totalAmount.toString(),
      itemCount: _count.orderItems,
    }));
  }

  async findDetailsForDistributor(
    orderId: string,
    distributorId: string,
  ): Promise<DistributorOrderDetails | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        ...soldBy(distributorId),
      },
      select: {
        id: true,
        date: true,
        status: true,
        totalAmount: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        retailer: {
          select: { id: true, shopName: true },
        },
        orderItems: {
          where: itemsSoldBy(distributorId),
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            distributorProductId: true,
            distributorProduct: {
              select: {
                product: {
                  select: { id: true, name: true, brand: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    const { orderItems, totalAmount, ...rest } = order;

    return {
      ...rest,
      totalAmount: totalAmount.toString(),
      items: orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: lineTotal(item.unitPrice.toString(), item.quantity),
        distributorProductId: item.distributorProductId,
        product: item.distributorProduct.product,
      })),
    };
  }

  // The status check is part of the update itself, so two concurrent decisions
  // on the same order cannot both succeed.
  async updateStatus(change: OrderStatusChange): Promise<boolean> {
    const updated = await this.prisma.order.updateMany({
      where: {
        id: change.orderId,
        status: change.from,
        ...soldBy(change.distributorId),
      },
      data: {
        status: change.to,
        rejectionReason: change.rejectionReason ?? null,
      },
    });

    return updated.count > 0;
  }
}

import { randomUUID } from "node:crypto";
import type { Distributor } from "../../src/modules/distributor/distributor.types";
import type {
  DistributorOrderDetails,
  NewOrderItem,
  OrderStatus,
} from "../../src/modules/order/order.types";
import type {
  OrderTransaction,
  OrderUnitOfWork,
} from "../../src/modules/order/order.unitOfWork";
import type { Retailer } from "../../src/modules/retailer/retailer.types";

// A distributor's listing of a product.
export interface Listing {
  id: string;
  distributorId: string;
  productId: string;
  unitPrice: string;
  stock: number;
}

interface StoredOrderItem extends NewOrderItem {
  id: string;
}

export interface StoredOrder {
  id: string;
  retailerId: string;
  status: OrderStatus;
  rejectionReason: string | null;
  date: Date;
  items: StoredOrderItem[];
}

export interface OrderState {
  retailers: Retailer[];
  distributors: Distributor[];
  listings: Listing[];
  orders: StoredOrder[];
}

const total = (items: NewOrderItem[]): string =>
  items
    .reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
    .toFixed(2);

// Keeps everything in memory. Like the real unit of work, a throw inside
// run() undoes every write made during that run.
export class InMemoryOrderUnitOfWork implements OrderUnitOfWork {
  constructor(public state: OrderState) {}

  async run<T>(
    work: (transaction: OrderTransaction) => Promise<T>,
  ): Promise<T> {
    const snapshot = structuredClone(this.state);

    try {
      return await work(this.transaction());
    } catch (error) {
      this.state = snapshot;
      throw error;
    }
  }

  protected transaction(): OrderTransaction {
    const state = this.state;

    const detailsFor = (
      order: StoredOrder,
      distributorId: string,
    ): DistributorOrderDetails | null => {
      const items = order.items.filter((item) =>
        state.listings.some(
          (listing) =>
            listing.id === item.distributorProductId &&
            listing.distributorId === distributorId,
        ),
      );

      if (items.length === 0) {
        return null;
      }

      const retailer = state.retailers.find(
        (candidate) => candidate.id === order.retailerId,
      );

      return {
        id: order.id,
        date: order.date,
        status: order.status,
        totalAmount: total(items),
        rejectionReason: order.rejectionReason,
        createdAt: order.date,
        updatedAt: order.date,
        retailer: { id: order.retailerId, shopName: retailer?.shopName ?? "" },
        items: items.map((item) => {
          const listing = state.listings.find(
            (candidate) => candidate.id === item.distributorProductId,
          )!;

          return {
            id: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: total([item]),
            distributorProductId: item.distributorProductId,
            product: { id: listing.productId, name: "Product", brand: "Brand" },
          };
        }),
      };
    };

    return {
      retailers: {
        findByUserId: async (userId) =>
          state.retailers.find((retailer) => retailer.userId === userId) ??
          null,
      },

      distributors: {
        exists: async (id) =>
          state.distributors.some((distributor) => distributor.id === id),

        findByUserId: async (userId) =>
          state.distributors.find(
            (distributor) => distributor.userId === userId,
          ) ?? null,
      },

      distributorProducts: {
        findPricing: async (distributorId, productId) => {
          const listing = state.listings.find(
            (candidate) =>
              candidate.distributorId === distributorId &&
              candidate.productId === productId,
          );

          return listing
            ? { id: listing.id, unitPrice: listing.unitPrice }
            : null;
        },

        reserveStock: async (distributorId, productId, quantity) => {
          const listing = state.listings.find(
            (candidate) =>
              candidate.distributorId === distributorId &&
              candidate.productId === productId,
          );

          if (!listing || listing.stock < quantity) {
            return null;
          }

          listing.stock -= quantity;
          return listing.stock;
        },

        releaseStock: async (distributorProductId, quantity) => {
          const listing = state.listings.find(
            (candidate) => candidate.id === distributorProductId,
          );

          if (listing) {
            listing.stock += quantity;
          }
        },
      },

      orders: {
        create: async (order) => {
          const id = randomUUID();
          const date = new Date();
          const items = order.items.map((item) => ({
            id: randomUUID(),
            ...item,
          }));

          state.orders.push({
            id,
            retailerId: order.retailerId,
            status: order.status,
            rejectionReason: null,
            date,
            items,
          });

          return {
            id,
            date,
            totalAmount: total(items),
            status: order.status,
            rejectionReason: null,
            createdAt: date,
            updatedAt: date,
            retailerId: order.retailerId,
            orderItems: items.map((item) => ({
              ...item,
              createdAt: date,
              updatedAt: date,
              orderId: id,
            })),
          };
        },

        findByDistributorId: async (distributorId, status) =>
          state.orders
            .map((order) => detailsFor(order, distributorId))
            .filter((order) => order !== null)
            .filter((order) => !status || order.status === status)
            .map((order) => ({
              id: order.id,
              date: order.date,
              status: order.status,
              totalAmount: order.totalAmount,
              retailer: order.retailer,
              itemCount: order.items.length,
            })),

        findDetailsForDistributor: async (orderId, distributorId) => {
          const order = state.orders.find(
            (candidate) => candidate.id === orderId,
          );

          return order ? detailsFor(order, distributorId) : null;
        },

        updateStatus: async (change) => {
          const order = state.orders.find(
            (candidate) => candidate.id === change.orderId,
          );

          if (
            !order ||
            order.status !== change.from ||
            !detailsFor(order, change.distributorId)
          ) {
            return false;
          }

          order.status = change.to;
          order.rejectionReason = change.rejectionReason ?? null;
          return true;
        },
      },
    };
  }
}

const now = new Date("2026-01-01T00:00:00Z");

export const RETAILER_USER_ID = "user-retailer";
export const DISTRIBUTOR_USER_ID = "user-distributor";
export const OTHER_DISTRIBUTOR_USER_ID = "user-other-distributor";

// One retailer, two distributors. The first distributor lists two products.
export const createOrderState = (): OrderState => ({
  retailers: [
    {
      id: "retailer-1",
      shopName: "Corner Shop",
      userId: RETAILER_USER_ID,
      createdAt: now,
      updatedAt: now,
    },
  ],
  distributors: [
    {
      id: "distributor-1",
      businessName: "Wholesale One",
      contactInfo: null,
      userId: DISTRIBUTOR_USER_ID,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "distributor-2",
      businessName: "Wholesale Two",
      contactInfo: null,
      userId: OTHER_DISTRIBUTOR_USER_ID,
      createdAt: now,
      updatedAt: now,
    },
  ],
  listings: [
    {
      id: "listing-a",
      distributorId: "distributor-1",
      productId: "product-a",
      unitPrice: "10.50",
      stock: 10,
    },
    {
      id: "listing-b",
      distributorId: "distributor-1",
      productId: "product-b",
      unitPrice: "4.00",
      stock: 2,
    },
  ],
  orders: [],
});

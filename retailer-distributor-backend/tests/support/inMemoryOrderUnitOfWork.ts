import { randomUUID } from "node:crypto";
import type { Distributor } from "../../src/modules/distributor/distributor.types";
import { distinctDistributors } from "../../src/modules/order/order.distributors";
import { lineTotal } from "../../src/modules/order/order.money";
import type { StockIndex } from "../../src/modules/order/order.stockIndex";
import type {
  DistributorOrderDetails,
  ListingStock,
  NewOrderItem,
  OrderStatus,
  RetailerOrderDetails,
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
  totalAmount: string;
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

// Records what the services send to the search index.
export class RecordingStockIndex implements StockIndex {
  updates: ListingStock[] = [];

  async updateStock(distributorProductId: string, stock: number) {
    this.updates.push({ distributorProductId, stock });
  }
}

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

  read<T>(work: (repositories: OrderTransaction) => Promise<T>): Promise<T> {
    return work(this.transaction());
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
        // Like the real repository: the total of the whole order.
        totalAmount: order.totalAmount,
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
            lineTotal: lineTotal(item.unitPrice, item.quantity),
            distributorProductId: item.distributorProductId,
            product: { id: listing.productId, name: "Product", brand: "Brand" },
          };
        }),
      };
    };

    // Like the real repository: every item, each with its distributor.
    const detailsForRetailer = (order: StoredOrder): RetailerOrderDetails => {
      const items = order.items.map((item) => {
        const listing = state.listings.find(
          (candidate) => candidate.id === item.distributorProductId,
        )!;
        const distributor = state.distributors.find(
          (candidate) => candidate.id === listing.distributorId,
        )!;

        return {
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: lineTotal(item.unitPrice, item.quantity),
          distributorProductId: item.distributorProductId,
          product: { id: listing.productId, name: "Product", brand: "Brand" },
          distributor: {
            id: distributor.id,
            businessName: distributor.businessName,
          },
        };
      });

      return {
        id: order.id,
        date: order.date,
        status: order.status,
        totalAmount: order.totalAmount,
        rejectionReason: order.rejectionReason,
        createdAt: order.date,
        updatedAt: order.date,
        distributors: distinctDistributors(
          items.map((item) => item.distributor),
        ),
        items,
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

          if (!listing) {
            throw new Error(`Listing ${distributorProductId} not found`);
          }

          listing.stock += quantity;
          return listing.stock;
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
            totalAmount: order.totalAmount,
            rejectionReason: null,
            date,
            items,
          });

          return {
            id,
            date,
            totalAmount: order.totalAmount,
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

        findByRetailerId: async (retailerId, status) =>
          state.orders
            .filter((order) => order.retailerId === retailerId)
            .filter((order) => !status || order.status === status)
            .map(detailsForRetailer)
            .map((order) => ({
              id: order.id,
              date: order.date,
              status: order.status,
              totalAmount: order.totalAmount,
              distributors: order.distributors,
              itemCount: order.items.length,
            })),

        findDetailsForRetailer: async (orderId, retailerId) => {
          const order = state.orders.find(
            (candidate) =>
              candidate.id === orderId && candidate.retailerId === retailerId,
          );

          return order ? detailsForRetailer(order) : null;
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
export const OTHER_RETAILER_USER_ID = "user-other-retailer";
export const DISTRIBUTOR_USER_ID = "user-distributor";
export const OTHER_DISTRIBUTOR_USER_ID = "user-other-distributor";

// Two retailers, two distributors. The first distributor lists two products.
export const createOrderState = (): OrderState => ({
  retailers: [
    {
      id: "retailer-1",
      shopName: "Corner Shop",
      userId: RETAILER_USER_ID,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "retailer-2",
      shopName: "Market Stall",
      userId: OTHER_RETAILER_USER_ID,
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

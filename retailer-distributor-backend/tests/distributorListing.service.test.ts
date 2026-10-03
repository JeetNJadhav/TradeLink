import { beforeEach, describe, expect, it, vi } from "vitest";
import { DistributorListingService } from "../src/modules/distributorProduct/distributorListing.service";
import {
  addListingSchema,
  MAX_LISTING_STOCK,
  updateListingSchema,
} from "../src/modules/distributorProduct/distributorProduct.validation";
import {
  createListingState,
  DISTRIBUTOR_USER_ID,
  InMemoryListings,
  OTHER_DISTRIBUTOR_USER_ID,
  RecordingListingIndex,
  UNLOCATED_DISTRIBUTOR_USER_ID,
} from "./support/inMemoryListings";

describe("DistributorListingService", () => {
  let store: InMemoryListings;
  let listingIndex: RecordingListingIndex;
  let service: DistributorListingService;

  const stored = (listingId: string) =>
    store.state.listings.find((listing) => listing.id === listingId)!;

  beforeEach(() => {
    store = new InMemoryListings(createListingState());
    listingIndex = new RecordingListingIndex();
    service = new DistributorListingService(
      store.listings,
      store.distributors,
      store.products,
      listingIndex,
    );
  });

  describe("listListings", () => {
    it("returns only the caller's listings, with their products", async () => {
      const listings = await service.listListings(DISTRIBUTOR_USER_ID);

      expect(listings).toHaveLength(1);
      expect(listings[0]).toMatchObject({
        id: "listing-a",
        price: 10.5,
        stock: 10,
        product: { id: "product-a", name: "Product A" },
      });
    });

    it("leaves out a listing the distributor removed", async () => {
      await service.removeListing(DISTRIBUTOR_USER_ID, "listing-a");

      expect(await service.listListings(DISTRIBUTOR_USER_ID)).toEqual([]);
    });

    it("fails when the user has no distributor profile", async () => {
      await expect(service.listListings("user-unknown")).rejects.toMatchObject({
        statusCode: 404,
        message: "Distributor not found",
      });
    });
  });

  describe("addListing", () => {
    it("lists a product for the caller", async () => {
      const listing = await service.addListing(DISTRIBUTOR_USER_ID, {
        productId: "product-c",
        price: 25,
        stock: 40,
      });

      expect(listing).toMatchObject({
        distributorId: "distributor-1",
        productId: "product-c",
        price: 25,
        stock: 40,
        isActive: true,
      });
      expect(await service.listListings(DISTRIBUTOR_USER_ID)).toHaveLength(2);
    });

    it("lets two distributors list the same product", async () => {
      const listing = await service.addListing(DISTRIBUTOR_USER_ID, {
        productId: "product-b",
        price: 5,
        stock: 1,
      });

      expect(listing.distributorId).toBe("distributor-1");
      expect(stored("listing-b")).toMatchObject({ price: 4, stock: 2 });
    });

    it("refuses a product the distributor already lists", async () => {
      await expect(
        service.addListing(DISTRIBUTOR_USER_ID, {
          productId: "product-a",
          price: 99,
          stock: 99,
        }),
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(stored("listing-a")).toMatchObject({ price: 10.5, stock: 10 });
      expect(listingIndex.upserts).toEqual([]);
    });

    it("brings back a removed listing with the new price and stock", async () => {
      await service.removeListing(DISTRIBUTOR_USER_ID, "listing-a");

      const listing = await service.addListing(DISTRIBUTOR_USER_ID, {
        productId: "product-a",
        price: 12,
        stock: 3,
      });

      expect(listing).toMatchObject({ id: "listing-a", price: 12, stock: 3 });
      expect(store.state.listings).toHaveLength(2);
    });

    it("fails when the product does not exist", async () => {
      await expect(
        service.addListing(DISTRIBUTOR_USER_ID, {
          productId: "product-unknown",
          price: 1,
          stock: 1,
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Product not found",
      });

      expect(store.state.listings).toHaveLength(2);
    });
  });

  describe("updateListing", () => {
    it("changes only the price when only the price is sent", async () => {
      const listing = await service.updateListing(
        DISTRIBUTOR_USER_ID,
        "listing-a",
        { price: 11.25 },
      );

      expect(listing).toMatchObject({ price: 11.25, stock: 10 });
    });

    it("changes only the stock when only the stock is sent", async () => {
      const listing = await service.updateListing(
        DISTRIBUTOR_USER_ID,
        "listing-a",
        { stock: 0 },
      );

      expect(listing).toMatchObject({ price: 10.5, stock: 0 });
    });

    it("reports another distributor's listing as missing and leaves it alone", async () => {
      await expect(
        service.updateListing(DISTRIBUTOR_USER_ID, "listing-b", {
          price: 0.01,
          stock: 0,
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Listing not found",
      });

      expect(stored("listing-b")).toMatchObject({ price: 4, stock: 2 });
      expect(listingIndex.upserts).toEqual([]);
    });

    it("reports a removed listing as missing", async () => {
      await service.removeListing(DISTRIBUTOR_USER_ID, "listing-a");

      await expect(
        service.updateListing(DISTRIBUTOR_USER_ID, "listing-a", { stock: 5 }),
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(stored("listing-a").stock).toBe(10);
    });
  });

  describe("removeListing", () => {
    it("switches the listing off and keeps its row for past orders", async () => {
      await service.removeListing(DISTRIBUTOR_USER_ID, "listing-a");

      expect(stored("listing-a").isActive).toBe(false);
      expect(store.state.listings).toHaveLength(2);
    });

    it("reports another distributor's listing as missing and leaves it alone", async () => {
      await expect(
        service.removeListing(DISTRIBUTOR_USER_ID, "listing-b"),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Listing not found",
      });

      expect(stored("listing-b").isActive).toBe(true);
      expect(listingIndex.removals).toEqual([]);
    });

    it("reports a second removal as missing", async () => {
      await service.removeListing(DISTRIBUTOR_USER_ID, "listing-a");

      await expect(
        service.removeListing(DISTRIBUTOR_USER_ID, "listing-a"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("search index", () => {
    it("indexes a new listing", async () => {
      const listing = await service.addListing(DISTRIBUTOR_USER_ID, {
        productId: "product-c",
        price: 25,
        stock: 40,
      });

      expect(listingIndex.upserts).toEqual([
        expect.objectContaining({
          id: listing.id,
          productId: "product-c",
          productName: "Product C",
          distributorId: "distributor-1",
          distributorName: "Wholesale One",
          price: 25,
          stock: 40,
          location: { lat: 18.52, lon: 73.85 },
        }),
      ]);
      expect(listingIndex.removals).toEqual([]);
    });

    it("reindexes a listing with its new price and stock", async () => {
      await service.updateListing(DISTRIBUTOR_USER_ID, "listing-a", {
        price: 9,
        stock: 4,
      });

      expect(listingIndex.upserts).toEqual([
        expect.objectContaining({ id: "listing-a", price: 9, stock: 4 }),
      ]);
    });

    it("removes the document of a removed listing", async () => {
      await service.removeListing(DISTRIBUTOR_USER_ID, "listing-a");

      expect(listingIndex.removals).toEqual(["listing-a"]);
      expect(listingIndex.upserts).toEqual([]);
    });

    it("does not index the listing of a distributor without a location", async () => {
      const listing = await service.addListing(UNLOCATED_DISTRIBUTOR_USER_ID, {
        productId: "product-c",
        price: 25,
        stock: 40,
      });

      expect(listing.stock).toBe(40);
      expect(listingIndex.upserts).toEqual([]);
      expect(listingIndex.removals).toEqual([listing.id]);
    });

    it("does not touch the index when the change is refused", async () => {
      await expect(
        service.updateListing(OTHER_DISTRIBUTOR_USER_ID, "listing-a", {
          stock: 1,
        }),
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(listingIndex.upserts).toEqual([]);
      expect(listingIndex.removals).toEqual([]);
    });

    describe("when the index is unavailable", () => {
      const unavailable = async () => {
        throw new Error("index unavailable");
      };

      beforeEach(() => {
        listingIndex.upsertListing = unavailable;
        listingIndex.removeListing = unavailable;
      });

      it("still adds the listing", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => {});

        const listing = await service.addListing(DISTRIBUTOR_USER_ID, {
          productId: "product-c",
          price: 25,
          stock: 40,
        });

        expect(stored(listing.id).stock).toBe(40);
        expect(logged).toHaveBeenCalledOnce();

        logged.mockRestore();
      });

      it("still updates the listing", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => {});

        const listing = await service.updateListing(
          DISTRIBUTOR_USER_ID,
          "listing-a",
          { stock: 7 },
        );

        expect(listing.stock).toBe(7);
        expect(stored("listing-a").stock).toBe(7);
        expect(logged).toHaveBeenCalledOnce();

        logged.mockRestore();
      });

      it("still removes the listing", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => {});

        await service.removeListing(DISTRIBUTOR_USER_ID, "listing-a");

        expect(stored("listing-a").isActive).toBe(false);
        expect(logged).toHaveBeenCalledOnce();

        logged.mockRestore();
      });
    });
  });
});

describe("listing validation", () => {
  const PRODUCT_ID = "3f2c1b9e-8a47-4d5e-9c21-7b6a5d4e3f10";

  const addErrors = (payload: unknown) =>
    addListingSchema.validate(payload).error?.message;

  const updateErrors = (payload: unknown) =>
    updateListingSchema.validate(payload).error?.message;

  it("accepts a price with two decimals and a stock of zero", () => {
    expect(
      addErrors({ productId: PRODUCT_ID, price: 10.5, stock: 0 }),
    ).toBeUndefined();
  });

  it.each([0, -1, 10.999])("refuses a price of %s", (price) => {
    expect(addErrors({ productId: PRODUCT_ID, price, stock: 1 })).toBeDefined();
    expect(updateErrors({ price })).toBeDefined();
  });

  it.each([-1, 1.5, MAX_LISTING_STOCK + 1])(
    "refuses a stock of %s",
    (stock) => {
      expect(
        addErrors({ productId: PRODUCT_ID, price: 1, stock }),
      ).toBeDefined();
      expect(updateErrors({ stock })).toBeDefined();
    },
  );

  it("refuses numbers sent as text", () => {
    expect(updateErrors({ price: "10" })).toBeDefined();
    expect(updateErrors({ stock: "10" })).toBeDefined();
  });

  it("requires every field when adding a listing", () => {
    expect(addErrors({ productId: PRODUCT_ID, price: 1 })).toBeDefined();
    expect(addErrors({ productId: PRODUCT_ID, stock: 1 })).toBeDefined();
    expect(addErrors({ price: 1, stock: 1 })).toBeDefined();
    expect(
      addErrors({ productId: "not-a-uuid", price: 1, stock: 1 }),
    ).toBeDefined();
  });

  it("requires a price or a stock when updating a listing", () => {
    expect(updateErrors({})).toBeDefined();
    expect(updateErrors({ price: 2 })).toBeUndefined();
    expect(updateErrors({ stock: 2 })).toBeUndefined();
    expect(updateErrors({ price: 2, stock: 2 })).toBeUndefined();
  });

  it("refuses fields a distributor may not set", () => {
    expect(updateErrors({ stock: 2, isActive: false })).toBeDefined();
    expect(updateErrors({ stock: 2, distributorId: PRODUCT_ID })).toBeDefined();
  });
});

import type { SearchIndexer } from "../search/search.repository";
import type { ListingStock } from "./order.types";

// Where search reads stock from. Orders change stock in the database; this
// keeps the copy in the search index in step.
export type StockIndex = Pick<SearchIndexer, "updateStock">;

// Call only after the transaction has committed. The index is a copy, so a
// failure here is logged and never fails the order: the next reindex repairs it.
export const syncListingStock = async (
  stockIndex: StockIndex,
  listings: ListingStock[],
): Promise<void> => {
  const results = await Promise.allSettled(
    listings.map((listing) =>
      stockIndex.updateStock(listing.distributorProductId, listing.stock),
    ),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        "Failed to update stock in the search index:",
        result.reason,
      );
    }
  }
};

import { toSearchDocument } from "../search/search.document";
import type { SearchIndexer } from "../search/search.repository";
import type { DistributorProductWithDetails } from "./distributorProduct.types";

// Where search reads listings from. Distributors change their listings in the
// database; this keeps the copy in the search index in step.
export type ListingIndex = Pick<
  SearchIndexer,
  "upsertListing" | "removeListing"
>;

const logFailure = (error: unknown): void => {
  console.error("Failed to update a listing in the search index:", error);
};

// Call only after the change has been committed. The index is a copy, so a
// failure here is logged and never fails the request: the next reindex repairs it.
export const indexListing = async (
  listingIndex: ListingIndex,
  listing: DistributorProductWithDetails,
): Promise<void> => {
  try {
    const document = toSearchDocument(listing);

    // No document means the listing cannot be searched for, so it must not
    // stay in the index either.
    if (document) {
      await listingIndex.upsertListing(document);
    } else {
      await listingIndex.removeListing(listing.id);
    }
  } catch (error) {
    logFailure(error);
  }
};

export const unindexListing = async (
  listingIndex: ListingIndex,
  distributorProductId: string,
): Promise<void> => {
  try {
    await listingIndex.removeListing(distributorProductId);
  } catch (error) {
    logFailure(error);
  }
};

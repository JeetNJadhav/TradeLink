import type { DistributorProductWithDetails } from "../distributorProduct/distributorProduct.types";
import type { SearchDocument } from "./search.types";

// The search document of one listing, located at its distributor's first
// location. Null when the distributor has no location to search by.
export const toSearchDocument = (
  listing: DistributorProductWithDetails,
): SearchDocument | null => {
  const location = listing.distributor.locations[0];

  if (!location) {
    return null;
  }

  return {
    id: listing.id,
    productId: listing.productId,
    productName: listing.product.name,
    productCategory: listing.product.category,
    brand: listing.product.brand,
    distributorId: listing.distributorId,
    distributorName: listing.distributor.businessName,
    price: listing.price,
    stock: listing.stock,
    location: {
      lat: location.latitude,
      lon: location.longitude,
    },
    updatedAt: listing.updatedAt.toISOString(),
  };
};

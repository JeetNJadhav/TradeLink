import {
  CATALOG_PRODUCTS_API,
  DISTRIBUTOR_LISTING_API,
  DISTRIBUTOR_LISTINGS_API,
} from "../../../../shared/api/api";
import apiClient from "../../../../shared/api/apiClient";
import type {
  CatalogProduct,
  CatalogProductsResponse,
  Listing,
  ListingChanges,
  ListingResponse,
  ListingsResponse,
  NewListing,
} from "../types/listing";

export const getListings = async (signal?: AbortSignal): Promise<Listing[]> => {
  const response = await apiClient.get<ListingsResponse>(
    DISTRIBUTOR_LISTINGS_API,
    { signal },
  );
  return response.data.data.distributorProducts;
};

export const addListing = async (listing: NewListing): Promise<Listing> => {
  const response = await apiClient.post<ListingResponse>(
    DISTRIBUTOR_LISTINGS_API,
    listing,
  );
  return response.data.data.distributorProduct;
};

export const updateListing = async (
  id: string,
  changes: ListingChanges,
): Promise<Listing> => {
  const response = await apiClient.patch<ListingResponse>(
    DISTRIBUTOR_LISTING_API(id),
    changes,
  );
  return response.data.data.distributorProduct;
};

export const removeListing = async (id: string): Promise<void> => {
  await apiClient.delete(DISTRIBUTOR_LISTING_API(id));
};

// Products of the master list whose name or brand matches the query.
export const searchCatalogProducts = async (
  query: string,
  signal?: AbortSignal,
): Promise<CatalogProduct[]> => {
  const response = await apiClient.get<CatalogProductsResponse>(
    CATALOG_PRODUCTS_API,
    { params: { q: query }, signal },
  );
  return response.data.data.products;
};

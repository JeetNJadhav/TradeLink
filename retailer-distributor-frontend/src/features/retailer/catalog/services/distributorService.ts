import {
  DISTRIBUTOR_PRODUCT_DETAILS_API,
  DISTRIBUTOR_PRODUCTS_API,
} from "../../../../shared/api/api";
import apiClient from "../../../../shared/api/apiClient";
import type {
  DistributorProductDetails,
  DistributorProductDetailsResponse,
  DistributorProductItem,
  DistributorProductsResponse,
} from "../types/distributor";

// Resolves to null when no listing has that id.
export const getDistributorProductById = async (
  id: string,
  signal?: AbortSignal,
): Promise<DistributorProductDetails | null> => {
  const response = await apiClient.get<DistributorProductDetailsResponse>(
    DISTRIBUTOR_PRODUCT_DETAILS_API(id),
    { signal },
  );
  return response.data.data.distributorProduct;
};

export const getDistributorProducts = async (
  distributorId: string,
  signal?: AbortSignal,
): Promise<DistributorProductItem[]> => {
  const response = await apiClient.get<DistributorProductsResponse>(
    DISTRIBUTOR_PRODUCTS_API(distributorId),
    { signal },
  );
  return response.data.data.products;
};

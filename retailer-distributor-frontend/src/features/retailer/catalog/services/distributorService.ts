import {
  DISTRIBUTOR_API,
  DISTRIBUTOR_PRODUCT_DETAILS_API,
  DISTRIBUTOR_PRODUCTS_API,
} from "../../../../shared/api/api";
import apiClient from "../../../../shared/api/apiClient";
import type {
  DistributorProductDetailsResponse,
  DistributorProductsResponse,
} from "../types/distributor";

export const getDistributorById = async (id: string) => {
  const response = await apiClient.get(DISTRIBUTOR_API(id));
  return response.data;
};

export const getDistributorProductById = async (
  id: string,
): Promise<DistributorProductDetailsResponse> => {
  const response = await apiClient.get<DistributorProductDetailsResponse>(
    DISTRIBUTOR_PRODUCT_DETAILS_API(id),
  );
  return response.data;
};

export const getDistributorProducts = async (
  id: string,
): Promise<DistributorProductsResponse> => {
  const response = await apiClient.get<DistributorProductsResponse>(
    DISTRIBUTOR_PRODUCTS_API(id),
  );
  return response.data;
};

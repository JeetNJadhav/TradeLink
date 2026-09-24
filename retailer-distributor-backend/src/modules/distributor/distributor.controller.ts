import { Request, ResponseToolkit } from "@hapi/hapi";
import { getDistributorProductById } from "./distributor.service";
import { successResponse } from "../../utils/response";

import { getDistributorProducts } from "./distributor.service";

export const getDistributorProductsHandler = async (
  request: Request,
  h: ResponseToolkit,
) => {
  const { distributorId } = request.params as { distributorId: string };

  const products = await getDistributorProducts(distributorId);

  return successResponse(h, {
    products,
  });
};

export const getDistributorProductByIdHandler = async (
  request: Request,
  h: ResponseToolkit,
) => {
  const { distributorProductId } = request.params as {
    distributorProductId: string;
  };

  const distributorProduct =
    await getDistributorProductById(distributorProductId);

  return successResponse(h, {
    distributorProduct,
  });
};

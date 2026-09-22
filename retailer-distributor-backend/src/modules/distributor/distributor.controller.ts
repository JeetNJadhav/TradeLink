import { Request, ResponseToolkit } from "@hapi/hapi";
import { getDistributors } from "./distributor.service";
import { successResponse } from "../../utils/response";

export const getDistributorsHandler = async (
  request: Request,
  h: ResponseToolkit,
) => {
  const distributors = await getDistributors();

  return successResponse(h, {
    distributors,
  });
};

import { getDistributorById } from "./distributor.service";

export const getDistributorByIdHandler = async (
  request: Request,
  h: ResponseToolkit,
) => {
  const { id } = request.params as { id: string };

  const distributor = await getDistributorById(id);

  return successResponse(h, {
    distributor,
  });
};

import { getDistributorProducts } from "./distributor.service";

export const getDistributorProductsHandler = async (
  request: Request,
  h: ResponseToolkit,
) => {
  const { id } = request.params as { id: string };

  const products = await getDistributorProducts(id);

  return successResponse(h, {
    products,
  });
};

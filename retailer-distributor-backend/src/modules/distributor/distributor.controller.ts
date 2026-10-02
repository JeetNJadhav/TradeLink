import { Request, ResponseToolkit } from "@hapi/hapi";

import { DistributorService } from "./distributor.service";
import { successResponse } from "../../utils/response";

export const createGetDistributorProductsHandler =
  (distributorService: DistributorService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { distributorId } = request.params as {
      distributorId: string;
    };

    const products =
      await distributorService.getDistributorProducts(distributorId);

    return successResponse(h, {
      products,
    });
  };

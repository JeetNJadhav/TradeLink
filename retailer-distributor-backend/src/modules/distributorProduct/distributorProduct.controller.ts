import { Request, ResponseToolkit } from "@hapi/hapi";
import { DistributorProductService } from "./distributorProduct.service";
import { successResponse } from "../../utils/response";

export const createGetDistributorProductByIdHandler =
  (distributorProductService: DistributorProductService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { distributorProductId } = request.params as {
      distributorProductId: string;
    };

    const distributorProduct =
      await distributorProductService.getDistributorProductById(
        distributorProductId,
      );

    return successResponse(h, {
      distributorProduct,
    });
  };

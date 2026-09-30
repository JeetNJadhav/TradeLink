import { Request, ResponseToolkit } from "@hapi/hapi";
import { ProductService } from "./product.service";
import { successResponse } from "../../utils/response";

export const createProductDistributorsHandler =
  (productService: ProductService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { id } = request.params as { id: string };

    const distributors = await productService.getProductDistributors(id);

    return successResponse(h, { distributors });
  };

import { Request, ResponseToolkit } from "@hapi/hapi";
import { ProductService } from "./product.service";
import { successResponse } from "../../utils/response";

import { SearchService } from "../search/search.service";

export const createProductDistributorsHandler =
  (productService: ProductService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { id } = request.params as { id: string };

    const distributors = await productService.getProductDistributors(id);

    return successResponse(h, { distributors });
  };

export const createSearchProductsHandler =
  (searchService: SearchService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { q, latitude, longitude, sortBy } = request.query as {
      q: string;
      latitude?: number;
      longitude?: number;
      sortBy?: "relevance" | "nearest";
    };

    const results = await searchService.searchProducts({
      query: q,
      latitude,
      longitude,
      sortBy,
    });

    return h.response({
      success: true,
      data: {
        products: results,
      },
    });
  };

export const createProductSuggestions =
  (searchService: SearchService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { q } = request.query as { q?: string };

    const suggestions = await searchService.getProductSuggestions(q ?? "");

    return h.response({
      success: true,
      data: {
        suggestions,
      },
    });
  };

// Request
//    ↓
// Joi validation
//    ↓
// Hapi accepts/rejects request
//    ↓
// Controller
//    ↓
// TypeScript type assertion (`as {...}`)
//    ↓
// Service

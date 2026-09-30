import { Request, ResponseToolkit } from "@hapi/hapi";
import { SearchService } from "./search.service";
import { successResponse } from "../../utils/response";

export const createSearchHandler =
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

    // return h.response({
    //   success: true,
    //   data: {
    //     products: results,
    //   },
    // });
    successResponse(h, { results });
  };

export const createSeacrhSuggestions =
  (searchService: SearchService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { q } = request.query as { q?: string };

    const suggestions = await searchService.getProductSuggestions(q ?? "");

    // return h.response({
    //   success: true,
    //   data: {
    //     suggestions,
    //   },
    // });
    return successResponse(h, { suggestions });
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

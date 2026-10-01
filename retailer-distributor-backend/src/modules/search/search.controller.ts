import { Request, ResponseToolkit } from "@hapi/hapi";
import { SearchService } from "./search.service";
import { successResponse } from "../../utils/response";

export const createSeacrhSuggestionsHandler =
  (searchService: SearchService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { q } = request.query as { q?: string };

    const suggestions = await searchService.getProductSuggestions(q ?? "");

    return successResponse(h, { suggestions });
  };

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

    return successResponse(h, { products: results });
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

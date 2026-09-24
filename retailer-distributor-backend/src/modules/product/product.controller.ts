import { Request, ResponseToolkit } from "@hapi/hapi";
import { getProductDistributors } from "./product.service";
import { successResponse } from "../../utils/response";
import { OpenSearchRepository } from "../search/opensearch.repository";
import { SearchService } from "../search/search.service";

const searchRepository = new OpenSearchRepository();
const searchService = new SearchService(searchRepository);

export const getProductDistributorsHandler = async (
  request: Request,
  h: ResponseToolkit,
) => {
  const { id } = request.params as { id: string };

  const distributors = await getProductDistributors(id);

  return successResponse(h, {
    distributors,
  });
};

export const searchProducts = async (request: Request, h: ResponseToolkit) => {
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

export const getProductSuggestions = async (
  request: Request,
  h: ResponseToolkit,
) => {
  const { q } = request.query as {
    q?: string;
  };

  if (!q?.trim() || q.trim().length < 3) {
    return h.response({
      success: true,
      data: {
        suggestions: [],
      },
    });
  }

  const suggestions = await searchService.getProductSuggestions(q);

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

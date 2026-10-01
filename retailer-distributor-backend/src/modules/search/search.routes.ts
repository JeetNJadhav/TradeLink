import { Server } from "@hapi/hapi";
import { SearchService } from "./search.service";
import Joi from "joi";
import {
  createSeacrhSuggestionsHandler,
  createSearchHandler,
} from "./search.controller";
import { ROUTES } from "../../config/routes";

const searchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).required(),

  latitude: Joi.number().min(-90).max(90).when("sortBy", {
    is: "nearest",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  longitude: Joi.number().min(-180).max(180).when("sortBy", {
    is: "nearest",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  sortBy: Joi.string().valid("relevance", "nearest").optional(),
});

const suggestionsQuerySchema = Joi.object({
  q: Joi.string().trim().allow("").optional(),
});

export const registerSearchRoutes = (
  server: Server,
  searchService: SearchService,
) => {
  server.route([
    {
      method: "GET",
      path: ROUTES.SEARCH.SUGGESTIONS,
      options: {
        auth: "access-token",
        validate: { query: suggestionsQuerySchema },
      },
      handler: createSeacrhSuggestionsHandler(searchService),
    },

    {
      method: "GET",
      path: ROUTES.SEARCH.SEARCH_QUERY,
      options: {
        auth: "access-token",
        validate: { query: searchQuerySchema },
      },
      handler: createSearchHandler(searchService),
    },
  ]);
};

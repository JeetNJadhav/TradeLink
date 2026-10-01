import type { Client } from "@opensearch-project/opensearch";
import {
  SearchIndexer,
  SearchRepository,
} from "../../../modules/search/search.repository";
import {
  ProductSearchParams,
  ProductSuggestion,
  SearchDocument,
  SuggestionType,
} from "../../../modules/search/search.types";

const PRODUCTS_INDEX = "products";

// Each entry is one kind of suggestion. To suggest on another field, add an entry here.
interface SuggestionSource {
  type: SuggestionType;
  // field the query is matched against; also shown as the label
  labelField: "productName" | "brand" | "distributorName";
  idField: "productId" | "brand" | "distributorId";
  // how ids are compared when removing duplicates
  normalizeId?: (id: string) => string;
}

const SUGGESTION_SOURCES: SuggestionSource[] = [
  { type: "product", labelField: "productName", idField: "productId" },
  {
    type: "brand",
    labelField: "brand",
    idField: "brand",
    normalizeId: (id) => id.toLowerCase(),
  },
  {
    type: "distributor",
    labelField: "distributorName",
    idField: "distributorId",
  },
];

const EXACT_MATCH_BOOST = 5;
const PREFIX_MATCH_BOOST = 3;

interface SuggestionHit {
  _source?: Partial<SearchDocument>;
  _score?: number | null;
  matched_queries?: string[];
}

// takes our SearchDocument and puts it into products
export class OpenSearchRepository implements SearchRepository, SearchIndexer {
  constructor(private readonly client: Client) {}

  async indexProductDistributor(document: SearchDocument): Promise<void> {
    await this.client.index({
      index: PRODUCTS_INDEX,
      id: document.id,
      body: document,
    });
  }

  // productName^3 means product name gets higher relevance.
  async searchProducts(params: ProductSearchParams): Promise<SearchDocument[]> {
    const { query, latitude, longitude, sortBy } = params;

    const response = await this.client.search({
      index: PRODUCTS_INDEX,
      body: {
        size: 50,
        query: {
          bool: {
            should: [
              {
                match: {
                  productName: {
                    query,
                  },
                },
              },
              {
                match: {
                  brand: {
                    query,
                  },
                },
              },
              {
                term: {
                  productCategory: query.trim().toLowerCase(),
                },
              },
              {
                match: {
                  distributorName: {
                    query,
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },

        // need to create api for this
        ...(sortBy === "nearest" &&
        latitude !== undefined &&
        longitude !== undefined
          ? {
              sort: [
                {
                  _geo_distance: {
                    location: {
                      lat: latitude,
                      lon: longitude,
                    },
                    order: "asc",
                    unit: "km",
                  },
                },
              ],
            }
          : {}),
      },
    });

    return response.body.hits.hits
      .map((hit) => hit._source)
      .filter((source): source is SearchDocument => source !== undefined);
  }

  async getProductSuggestions(query: string): Promise<ProductSuggestion[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return [];
    }

    const response = await this.client.search({
      index: PRODUCTS_INDEX,

      body: {
        size: 50,

        collapse: {
          field: "productId",
        },

        query: {
          bool: {
            should: SUGGESTION_SOURCES.flatMap((source) => [
              // Exact match
              {
                match_phrase: {
                  [source.labelField]: {
                    query: normalizedQuery,
                    boost: EXACT_MATCH_BOOST,
                    _name: `${source.type}_exact`,
                  },
                },
              },
              // Autocomplete / prefix match
              {
                match_phrase_prefix: {
                  [source.labelField]: {
                    query: normalizedQuery,
                    boost: PREFIX_MATCH_BOOST,
                    _name: `${source.type}_prefix`,
                  },
                },
              },
            ]),

            minimum_should_match: 1,
          },
        },

        _source: [
          ...new Set(
            SUGGESTION_SOURCES.flatMap((source) => [
              source.idField,
              source.labelField,
            ]),
          ),
        ],
      },
    });

    const suggestions = new Map<
      string,
      ProductSuggestion & { score: number }
    >();

    for (const hit of response.body.hits.hits as SuggestionHit[]) {
      const score = hit._score ?? 0;
      const matchedQueries = hit.matched_queries ?? [];

      for (const source of SUGGESTION_SOURCES) {
        const id = hit._source?.[source.idField];
        const label = hit._source?.[source.labelField];
        const isExact = matchedQueries.includes(`${source.type}_exact`);
        const isPrefix = matchedQueries.includes(`${source.type}_prefix`);

        if (!id || !label || !(isExact || isPrefix)) {
          continue;
        }

        const key = `${source.type}:${source.normalizeId?.(id) ?? id}`;

        const suggestionScore =
          score + (isExact ? EXACT_MATCH_BOOST : PREFIX_MATCH_BOOST);

        const existing = suggestions.get(key);

        if (!existing || suggestionScore > existing.score) {
          suggestions.set(key, {
            type: source.type,
            id,
            label,
            score: suggestionScore,
          });
        }
      }
    }

    return Array.from(suggestions.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...suggestion }) => suggestion);
  }
}

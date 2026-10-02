import type { API, Client } from "@opensearch-project/opensearch";
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

// Documents sent per bulk request when indexing.
const BULK_BATCH_SIZE = 500;

const PRODUCTS_INDEX_DEFINITION: API.Indices_Create_RequestBody = {
  settings: {
    analysis: {
      normalizer: {
        // Makes productCategory match whatever the case of the query.
        category_normalizer: {
          type: "custom",
          filter: ["lowercase"],
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: "keyword" },
      productId: { type: "keyword" },
      productName: { type: "text" },
      productCategory: {
        type: "keyword",
        normalizer: "category_normalizer",
      },
      brand: { type: "text" },
      distributorId: { type: "keyword" },
      distributorName: { type: "text" },
      price: { type: "float" },
      stock: { type: "integer" },
      location: { type: "geo_point" },
      updatedAt: { type: "date" },
    },
  },
};

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

  async createIndex(): Promise<boolean> {
    const exists = await this.client.indices.exists({ index: PRODUCTS_INDEX });

    if (exists.body) {
      return false;
    }

    await this.client.indices.create({
      index: PRODUCTS_INDEX,
      body: PRODUCTS_INDEX_DEFINITION,
    });

    return true;
  }

  async recreateIndex(): Promise<void> {
    await this.client.indices.delete({
      index: PRODUCTS_INDEX,
      ignore_unavailable: true,
    });

    await this.createIndex();
  }

  async indexProductDistributors(documents: SearchDocument[]): Promise<void> {
    for (let start = 0; start < documents.length; start += BULK_BATCH_SIZE) {
      const batch = documents.slice(start, start + BULK_BATCH_SIZE);

      const response = await this.client.bulk({
        index: PRODUCTS_INDEX,
        body: batch.flatMap((document) => [
          { index: { _id: document.id } },
          document,
        ]),
      });

      // A bulk request succeeds as a whole even when single documents fail.
      if (response.body.errors) {
        const failed = response.body.items.find((item) => item.index?.error);

        throw new Error(
          `Indexing failed: ${failed?.index?.error?.reason ?? "unknown reason"}`,
        );
      }
    }
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

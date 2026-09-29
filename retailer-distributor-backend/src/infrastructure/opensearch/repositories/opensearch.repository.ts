import {
  ProductSearchParams,
  ProductSuggestion,
  SearchDocument,
  SearchRepository,
} from "../../../modules/search/search.repository";
import opensearchClient from "../openSearch.client";

const PRODUCTS_INDEX = "products";

// takes our SearchDocument and puts it into products
export class OpenSearchRepository implements SearchRepository {
  async indexProductDistributor(document: SearchDocument): Promise<void> {
    await opensearchClient.index({
      index: PRODUCTS_INDEX,
      id: document.id,
      body: document,
    });
  }

  // productName^3 means product name gets higher relevance.
  async searchProducts(params: ProductSearchParams): Promise<SearchDocument[]> {
    const { query, latitude, longitude, sortBy } = params;

    const response = await opensearchClient.search({
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
                match: {
                  productCategory: {
                    query,
                  },
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

    const response = await opensearchClient.search({
      index: PRODUCTS_INDEX,

      body: {
        size: 50,

        query: {
          bool: {
            should: [
              // Exact match
              {
                match_phrase: {
                  productName: {
                    query: normalizedQuery,
                    boost: 5,
                    _name: "product_exact",
                  },
                },
              },
              {
                match_phrase: {
                  brand: {
                    query: normalizedQuery,
                    boost: 5,
                    _name: "brand_exact",
                  },
                },
              },
              {
                match_phrase: {
                  distributorName: {
                    query: normalizedQuery,
                    boost: 5,
                    _name: "distributor_exact",
                  },
                },
              },

              // Autocomplete / prefix match
              {
                match_phrase_prefix: {
                  productName: {
                    query: normalizedQuery,
                    boost: 3,
                    _name: "product_prefix",
                  },
                },
              },
              {
                match_phrase_prefix: {
                  brand: {
                    query: normalizedQuery,
                    boost: 3,
                    _name: "brand_prefix",
                  },
                },
              },
              {
                match_phrase_prefix: {
                  distributorName: {
                    query: normalizedQuery,
                    boost: 3,
                    _name: "distributor_prefix",
                  },
                },
              },
            ],

            minimum_should_match: 1,
          },
        },

        _source: [
          "productId",
          "productName",
          "brand",
          "distributorId",
          "distributorName",
        ],
      },
    });

    const suggestions = new Map<
      string,
      ProductSuggestion & { score: number }
    >();

    for (const hit of response.body.hits.hits) {
      const source = hit._source as SearchDocument;
      const score = hit._score ?? 0;
      const matchedQueries = hit.matched_queries ?? [];

      // Product suggestion
      if (
        source.productId &&
        source.productName &&
        (matchedQueries.includes("product_exact") ||
          matchedQueries.includes("product_prefix"))
      ) {
        const key = `product:${source.productId}`;

        const suggestionScore =
          score + (matchedQueries.includes("product_exact") ? 5 : 3);

        const existing = suggestions.get(key);

        if (!existing || suggestionScore > existing.score) {
          suggestions.set(key, {
            type: "product",
            id: source.productId,
            label: source.productName,
            score: suggestionScore,
          });
        }
      }

      // Brand suggestion
      if (
        source.brand &&
        (matchedQueries.includes("brand_exact") ||
          matchedQueries.includes("brand_prefix"))
      ) {
        const key = `brand:${source.brand.toLowerCase()}`;

        const suggestionScore =
          score + (matchedQueries.includes("brand_exact") ? 5 : 3);

        const existing = suggestions.get(key);

        if (!existing || suggestionScore > existing.score) {
          suggestions.set(key, {
            type: "brand",
            id: source.brand,
            label: source.brand,
            score: suggestionScore,
          });
        }
      }

      // Distributor suggestion
      if (
        source.distributorId &&
        source.distributorName &&
        (matchedQueries.includes("distributor_exact") ||
          matchedQueries.includes("distributor_prefix"))
      ) {
        const key = `distributor:${source.distributorId}`;

        const suggestionScore =
          score + (matchedQueries.includes("distributor_exact") ? 5 : 3);

        const existing = suggestions.get(key);

        if (!existing || suggestionScore > existing.score) {
          suggestions.set(key, {
            type: "distributor",
            id: source.distributorId,
            label: source.distributorName,
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

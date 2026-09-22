import opensearchClient from "../../config/opensearch";
import {
  ProductSearchParams,
  ProductSuggestion,
  SearchDocument,
  SearchRepository,
} from "./search.repository";

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
    const response = await opensearchClient.search({
      index: PRODUCTS_INDEX,
      body: {
        size: 10,

        query: {
          match_phrase_prefix: {
            productName: {
              query,
            },
          },
        },

        collapse: {
          field: "productId",
        },

        _source: ["productId", "productName"],
      },
    });

    return response.body.hits.hits
      .map((hit) => hit._source as ProductSuggestion)
      .filter((source): source is ProductSuggestion => source !== undefined);
  }
}

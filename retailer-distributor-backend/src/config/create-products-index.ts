import opensearchClient from "./opensearch";

const INDEX_NAME = "products";

const createProductsIndex = async () => {
  try {
    const exists = await opensearchClient.indices.exists({
      index: INDEX_NAME,
    });

    if (exists.body) {
      console.log(`Index "${INDEX_NAME}" already exists`);
      return;
    }

    await opensearchClient.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            id: {
              type: "keyword",
            },

            productId: {
              type: "keyword",
            },

            productName: {
              type: "text",
            },

            productCategory: {
              type: "keyword",
            },

            brand: {
              type: "text",
            },

            distributorId: {
              type: "keyword",
            },

            distributorName: {
              type: "text",
            },

            price: {
              type: "float",
            },

            stock: {
              type: "integer",
            },

            location: {
              type: "geo_point",
            },

            updatedAt: {
              type: "date",
            },
          },
        },
      },
    });

    console.log(`Index "${INDEX_NAME}" created successfully`);
  } catch (error) {
    console.error("Failed to create products index:", error);
  }
};

createProductsIndex();

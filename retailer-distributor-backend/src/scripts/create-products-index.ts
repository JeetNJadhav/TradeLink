import opensearchClient from "../infrastructure/opensearch/opensearch.client";
import { OpenSearchRepository } from "../infrastructure/opensearch/repositories/search.repository.opensearch";
import type { SearchIndexer } from "../modules/search/search.repository";

const searchIndexer: SearchIndexer = new OpenSearchRepository(opensearchClient);

const createProductsIndex = async () => {
  const created = await searchIndexer.createIndex();

  console.log(
    created
      ? "Products index created successfully"
      : "Products index already exists. Run search:reindex to rebuild it",
  );
};

createProductsIndex().catch((error) => {
  console.error("Failed to create products index:", error);
  process.exit(1);
});

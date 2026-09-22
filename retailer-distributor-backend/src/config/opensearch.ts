import { Client } from "@opensearch-project/opensearch";

const opensearchClient = new Client({
  node: process.env.OPENSEARCH_URL || "http://localhost:9200",
});

export default opensearchClient;

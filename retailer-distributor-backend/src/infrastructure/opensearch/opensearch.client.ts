import { Client } from "@opensearch-project/opensearch";
import { env } from "../../config/env";

const opensearchClient = new Client({
  node: env.OPENSEARCH_URL,
});

export default opensearchClient;

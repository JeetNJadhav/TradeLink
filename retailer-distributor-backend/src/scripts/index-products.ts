import { OpenSearchRepository } from "../infrastructure/opensearch/repositories/search.repository.opensearch";
import opensearchClient from "../infrastructure/opensearch/opensearch.client";
import { prisma } from "../infrastructure/prisma/prisma.client";
import { PrismaDistributorProductRepository } from "../infrastructure/prisma/repositories/distributorProduct.repository.prisma";
import type { DistributorProductRepository } from "../modules/distributorProduct/distributorProduct.repository";
import { toSearchDocument } from "../modules/search/search.document";
import type { SearchIndexer } from "../modules/search/search.repository";
import type { SearchDocument } from "../modules/search/search.types";

const distributorProductRepository: DistributorProductRepository =
  new PrismaDistributorProductRepository(prisma);
const searchIndexer: SearchIndexer = new OpenSearchRepository(opensearchClient);

const indexProducts = async () => {
  const distributorProducts =
    await distributorProductRepository.findAllWithDetails();

  console.log(`Found ${distributorProducts.length} distributor products`);

  const documents: SearchDocument[] = [];

  for (const distributorProduct of distributorProducts) {
    const document = toSearchDocument(distributorProduct);

    if (!document) {
      console.warn(
        `Skipping ${distributorProduct.id}: distributor has no location`,
      );
      continue;
    }

    documents.push(document);
  }

  // The index is rebuilt from scratch: it gets the current mappings, and
  // documents of listings that no longer exist are gone.
  await searchIndexer.recreateIndex();
  await searchIndexer.indexProductDistributors(documents);

  console.log(`Indexed ${documents.length} products successfully`);
};

indexProducts()
  .catch((error) => {
    console.error("Failed to index products:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

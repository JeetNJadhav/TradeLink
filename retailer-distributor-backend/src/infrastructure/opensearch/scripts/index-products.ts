import { OpenSearchRepository } from "../repositories/opensearch.repository";
import opensearchClient from "../openSearch.client";
import { prisma } from "../../prisma/prisma.client";
import { PrismaDistributorProductRepository } from "../../prisma/repositories/distributorProduct.repository.prisma";
import type { DistributorProductRepository } from "../../../modules/distributorProduct/distributorProduct.repository";
import type { SearchIndexer } from "../../../modules/search/search.repository";

const distributorProductRepository: DistributorProductRepository =
  new PrismaDistributorProductRepository(prisma);
const searchIndexer: SearchIndexer = new OpenSearchRepository(opensearchClient);

const indexProducts = async () => {
  const distributorProducts =
    await distributorProductRepository.findAllWithDetails();

  console.log(`Found ${distributorProducts.length} distributor products`);

  for (const distributorProduct of distributorProducts) {
    const location = distributorProduct.distributor.locations[0];

    if (!location) {
      console.warn(
        `Skipping ${distributorProduct.id}: distributor has no location`,
      );
      continue;
    }

    await searchIndexer.indexProductDistributor({
      id: distributorProduct.id,
      productId: distributorProduct.productId,
      productName: distributorProduct.product.name,
      productCategory: distributorProduct.product.category,
      brand: distributorProduct.product.brand,
      distributorId: distributorProduct.distributorId,
      distributorName: distributorProduct.distributor.businessName,
      price: distributorProduct.price,
      stock: distributorProduct.stock,
      location: {
        lat: location.latitude,
        lon: location.longitude,
      },
      updatedAt: distributorProduct.updatedAt.toISOString(),
    });
  }

  console.log("Products indexed successfully");
};

indexProducts()
  .catch((error) => {
    console.error("Failed to index products:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

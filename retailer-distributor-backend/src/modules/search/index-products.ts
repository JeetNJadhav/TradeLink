import { prisma } from "../../config/prisma";
import { OpenSearchRepository } from "./opensearch.repository";

const searchRepository = new OpenSearchRepository();

const indexProducts = async () => {
  const distributorProducts = await prisma.distributorProduct.findMany({
    include: {
      product: true,
      distributor: {
        include: {
          locations: true,
        },
      },
    },
  });

  console.log(`Found ${distributorProducts.length} distributor products`);

  for (const distributorProduct of distributorProducts) {
    const location = distributorProduct.distributor.locations[0];

    if (!location) {
      console.warn(
        `Skipping ${distributorProduct.id}: distributor has no location`,
      );
      continue;
    }

    await searchRepository.indexProductDistributor({
      id: distributorProduct.id,
      productId: distributorProduct.productId,
      productName: distributorProduct.product.name,
      productCategory: distributorProduct.product.category,
      brand: distributorProduct.product.brand,
      distributorId: distributorProduct.distributorId,
      distributorName: distributorProduct.distributor.businessName,
      price: Number(distributorProduct.price),
      stock: distributorProduct.stock,
      location: {
        lat: Number(location.latitude),
        lon: Number(location.longitude),
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

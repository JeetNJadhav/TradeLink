import { prisma } from "../../config/prisma";

export const getProductDistributors = async (productId: string) => {
  return prisma.distributorProduct.findMany({
    where: {
      productId,
    },
    include: {
      distributor: {
        include: {
          locations: true,
        },
      },
    },
  });
};

import { prisma } from "../../config/prisma";

export const getDistributors = async () => {
  return prisma.distributor.findMany({
    include: {
      locations: true,
    },
  });
};

export const getDistributorById = async (id: string) => {
  return prisma.distributor.findUnique({
    where: { id },
    include: {
      locations: true,
      distributorProducts: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const getDistributorProducts = async (distributorId: string) => {
  return prisma.distributorProduct.findMany({
    where: {
      distributorId,
    },
    include: {
      product: true,
    },
  });
};

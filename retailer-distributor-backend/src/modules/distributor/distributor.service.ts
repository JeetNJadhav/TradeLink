import type { DistributorProductRepository } from "../distributorProduct/distributorProduct.repository";

// functional dependency injection not class like product module or search module
export type DistributorService = ReturnType<typeof createDistributorService>;

export const createDistributorService = (
  distributorProductRepository: Pick<
    DistributorProductRepository,
    "findByDistributorId"
  >,
) => ({
  getDistributorProducts: (distributorId: string) =>
    distributorProductRepository.findByDistributorId(distributorId),
});

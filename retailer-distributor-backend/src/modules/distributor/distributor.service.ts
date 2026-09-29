import type { DistributorRepository } from "./distributor.repository";

// functional dependency injection not class like product module or search module
export type DistributorService = ReturnType<typeof createDistributorService>;

export const createDistributorService = (
  distributorRepository: DistributorRepository,
) => ({
  getDistributors: () => distributorRepository.getDistributors(),

  getDistributorById: (id: string) =>
    distributorRepository.getDistributorById(id),

  getDistributorProducts: (distributorId: string) =>
    distributorRepository.getDistributorProducts(distributorId),

  getDistributorProductById: (id: string) =>
    distributorRepository.getDistributorProductById(id),
});

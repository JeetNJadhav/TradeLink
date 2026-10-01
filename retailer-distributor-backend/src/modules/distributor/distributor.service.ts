import type { DistributorRepository } from "./distributor.repository";
import type { DistributorProductRepository } from "../distributorProduct/distributorProduct.repository";

// functional dependency injection not class like product module or search module
export type DistributorService = ReturnType<typeof createDistributorService>;

export const createDistributorService = (
  distributorRepository: DistributorRepository,
  distributorProductRepository: DistributorProductRepository,
) => ({
  getDistributors: () => distributorRepository.getDistributors(),

  getDistributorById: (id: string) =>
    distributorRepository.getDistributorById(id),

  getDistributorProducts: (distributorId: string) =>
    distributorProductRepository.findByDistributorId(distributorId),

  getDistributorProductById: (id: string) =>
    distributorProductRepository.findById(id),
});

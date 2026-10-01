import type {
  DistributorWithLocations,
  DistributorWithProducts,
} from "./distributor.types";

export interface DistributorRepository {
  getDistributors(): Promise<DistributorWithLocations[]>;

  getDistributorById(id: string): Promise<DistributorWithProducts | null>;
}

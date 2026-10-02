import type {
  Distributor,
  DistributorWithLocations,
  DistributorWithProducts,
} from "./distributor.types";

export interface DistributorRepository {
  getDistributors(): Promise<DistributorWithLocations[]>;

  getDistributorById(id: string): Promise<DistributorWithProducts | null>;

  // The distributor profile of a signed-in user (User.id).
  findByUserId(userId: string): Promise<Distributor | null>;

  exists(id: string): Promise<boolean>;
}

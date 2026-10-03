import type { Distributor } from "./distributor.types";

export interface DistributorRepository {
  // The distributor profile of a signed-in user (User.id).
  findByUserId(userId: string): Promise<Distributor | null>;

  exists(id: string): Promise<boolean>;
}

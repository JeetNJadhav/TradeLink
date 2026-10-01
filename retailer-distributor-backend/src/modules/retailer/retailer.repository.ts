import type { Retailer } from "./retailer.types";

export interface RetailerRepository {
  findByUserId(userId: string): Promise<Retailer | null>;
}

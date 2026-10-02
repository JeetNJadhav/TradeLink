import type { ApiResponse } from "../../../shared/api/types";
import type { AccountLocation } from "../../../shared/types/account";
import type { UserRole } from "../../auth/types";

// The signed-in retailer's or distributor's own details.
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  // The retailer's shop name or the distributor's business name.
  organizationName: string;
  // Distributors only; null for retailers.
  contactInfo: string | null;
  // Null if the account has no location yet.
  location: AccountLocation | null;
}

export type ProfileResponse = ApiResponse<{ profile: Profile }>;

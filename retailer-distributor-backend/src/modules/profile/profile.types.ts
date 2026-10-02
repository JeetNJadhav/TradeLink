import type { AccountLocation, Role } from "../auth/auth.types";

// A retailer's or distributor's own details: the user, its shop or business,
// and where it is.
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  // The retailer's shop name or the distributor's business name.
  organizationName: string;
  // Distributors only; null for retailers.
  contactInfo: string | null;
  // The account's first location; null if it has none yet.
  location: AccountLocation | null;
}

// Email and role cannot be changed here.
export interface UpdateProfileInput {
  name: string;
  phone: string;
  organizationName: string;
  // Ignored for retailers.
  contactInfo?: string;
  location: AccountLocation;
}

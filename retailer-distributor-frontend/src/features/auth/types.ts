import type { ApiResponse } from "../../shared/api/types";
import type { AccountDetails } from "../../shared/types/account";

export type UserRole = "RETAILER" | "DISTRIBUTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  // The retailer's shop name or the distributor's business name.
  organizationName: string | null;
}

// Returned by /auth/login, /auth/me and /auth/register. Tokens travel in
// HttpOnly cookies.
export type AuthResponse = ApiResponse<{ user: AuthUser }>;

// Roles a person can sign up as. Admins are not self-registered.
export type RegistrationRole = Exclude<UserRole, "ADMIN">;

export interface RegisterRequest extends AccountDetails {
  role: RegistrationRole;
  email: string;
  password: string;
}

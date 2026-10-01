import type { ApiResponse } from "../../shared/api/types";

export type UserRole = "RETAILER" | "DISTRIBUTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

// Returned by /auth/login and /auth/me. Tokens travel in HttpOnly cookies.
export type AuthResponse = ApiResponse<{ user: AuthUser }>;

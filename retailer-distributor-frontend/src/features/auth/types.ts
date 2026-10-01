export type UserRole = "RETAILER" | "DISTRIBUTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  data: { accessToken: string; user: AuthUser };
}

export type UserRole = "RETAILER" | "DISTRIBUTOR";

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

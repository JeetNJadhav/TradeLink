import type { UserRole } from "./types";

// Where each role lands after signing in, and where it is sent when it opens
// a page meant for another role. Adding a role area starts here.
export const ROLE_HOME: Record<UserRole, string> = {
  RETAILER: "/",
  DISTRIBUTOR: "/distributor",
  ADMIN: "/admin",
};

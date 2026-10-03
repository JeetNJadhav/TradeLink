import type { UserRole } from "./types";

// Where each role lands after signing in, and where it is sent when it opens
// a page meant for another role. Adding a role area starts here.
export const ROLE_HOME: Record<UserRole, string> = {
  RETAILER: "/",
  DISTRIBUTOR: "/distributor",
  ADMIN: "/admin",
};

export const RETAILER_ORDERS_PATH = "/orders";
// Not below the distributor home, so the "Orders" tab is not active on it.
export const DISTRIBUTOR_PRODUCTS_PATH = "/my-products";

export interface NavItem {
  label: string;
  to: string;
  // Active only on this exact path, not on the pages below it.
  end?: boolean;
}

// The header tabs of each role. A new tab is a new entry here.
export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  RETAILER: [
    { label: "Products", to: ROLE_HOME.RETAILER, end: true },
    { label: "Orders", to: RETAILER_ORDERS_PATH },
  ],
  DISTRIBUTOR: [
    { label: "Orders", to: ROLE_HOME.DISTRIBUTOR },
    { label: "Products", to: DISTRIBUTOR_PRODUCTS_PATH },
  ],
  ADMIN: [],
};

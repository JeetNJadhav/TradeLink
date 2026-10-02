/**
 * Central place for every HTTP path exposed by the backend.
 *
 * Rules:
 *  - Routes files use these constants instead of string literals.
 *  - `{name}` segments are Hapi path params. The name must match the key
 *    used in the Joi params schema and in `request.params`.
 *  - To rename a URL, change it here only.
 */

// Base prefixes (kept private so groups below stay consistent)
const AUTH_BASE = "/auth";
const PRODUCTS_BASE = "/products";
const DISTRIBUTORS_BASE = "/distributors";
const DISTRIBUTOR_PRODUCTS_BASE = "/distributor-products";
const ORDERS_BASE = "/orders";
const DISTRIBUTOR_ORDERS_BASE = "/distributor/orders";
const SEARCH_BASE = "/search";

export const ROUTES = {
  HEALTH: "/health",

  AUTH: {
    BASE: AUTH_BASE, // also used as the refresh-cookie path
    LOGIN: `${AUTH_BASE}/login`,
    REFRESH: `${AUTH_BASE}/refresh`,
    LOGOUT: `${AUTH_BASE}/logout`,
    ME: `${AUTH_BASE}/me`,
  },

  PRODUCTS: {
    DISTRIBUTORS: `${PRODUCTS_BASE}/{id}/distributors`, // give me the distributors for this product
  },

  DISTRIBUTORS: {
    PRODUCTS: `${DISTRIBUTORS_BASE}/{distributorId}/products`,
  },

  DISTRIBUTOR_PRODUCTS: {
    BY_ID: `${DISTRIBUTOR_PRODUCTS_BASE}/{distributorProductId}`,
  },

  ORDERS: {
    CREATE: ORDERS_BASE,
  },

  // Orders received by the signed-in distributor.
  DISTRIBUTOR_ORDERS: {
    LIST: DISTRIBUTOR_ORDERS_BASE,
    BY_ID: `${DISTRIBUTOR_ORDERS_BASE}/{orderId}`,
    ACCEPT: `${DISTRIBUTOR_ORDERS_BASE}/{orderId}/accept`,
    REJECT: `${DISTRIBUTOR_ORDERS_BASE}/{orderId}/reject`,
  },

  SEARCH: {
    SUGGESTIONS: `${SEARCH_BASE}/suggestions`,
    SEARCH_QUERY: `${SEARCH_BASE}/q`,
  },
} as const;

/** Cookie paths (not API routes, but coupled to them). */
export const COOKIE_PATHS = {
  /** Sent on every request. */
  ROOT: "/",
  /** Refresh token cookie is only sent to /auth/* routes. */
  AUTH: ROUTES.AUTH.BASE,
} as const;

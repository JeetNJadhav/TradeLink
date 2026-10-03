// Paths are relative to the API base URL configured on apiClient.

// Auth APIs
export const LOGIN_API = "/auth/login";
export const REFRESH_API = "/auth/refresh";
export const LOGOUT_API = "/auth/logout";
export const CURRENT_USER_API = "/auth/me";
export const REGISTER_API = "/auth/register";
export const CHANGE_PASSWORD_API = "/auth/password";

// Profile APIs (the signed-in retailer's or distributor's own details)
export const PROFILE_API = "/profile";

// Product APIs
export const PRODUCT_SEARCH_API = "/search/q";
export const PRODUCT_SUGGESTIONS_API = "/search/suggestions";

// Distributor APIs
export const DISTRIBUTOR_PRODUCTS_API = (id: string) =>
  `/distributors/${id}/products`;
export const DISTRIBUTOR_PRODUCT_DETAILS_API = (id: string) =>
  `/distributor-products/${id}`;

// Order APIs
export const CREATE_ORDER_API = "/orders";

// Retailer order APIs (orders placed by the signed-in retailer)
export const ORDERS_API = "/orders";
export const ORDER_API = (id: string) => `/orders/${id}`;

// Distributor order APIs (orders received by the signed-in distributor)
export const DISTRIBUTOR_ORDERS_API = "/distributor/orders";
export const DISTRIBUTOR_ORDER_API = (id: string) =>
  `/distributor/orders/${id}`;
export const ACCEPT_ORDER_API = (id: string) =>
  `/distributor/orders/${id}/accept`;
export const REJECT_ORDER_API = (id: string) =>
  `/distributor/orders/${id}/reject`;

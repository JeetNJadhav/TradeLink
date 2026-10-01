// Paths are relative to the API base URL configured on apiClient.

// Auth APIs
export const LOGIN_API = "/auth/login";
export const REFRESH_API = "/auth/refresh";
export const LOGOUT_API = "/auth/logout";
export const CURRENT_USER_API = "/auth/me";

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

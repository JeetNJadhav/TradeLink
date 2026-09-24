const API_URL = import.meta.env.VITE_API_URL;

// Auth APIs
export const LOGIN_API = `${API_URL}/auth/login`;
export const REFRESH_API = `${API_URL}/auth/refresh`;
export const LOGOUT_API = `${API_URL}/auth/logout`;
export const CURRENT_USER_API = `${API_URL}/auth/me`;

// Product APIs
export const PRODUCT_SEARCH_API = `${API_URL}/products/search`;
export const PRODUCT_SUGGESTIONS_API = `${API_URL}/products/suggestions`;

// Distributor APIs
export const DISTRIBUTOR_API = (id: string) => `${API_URL}/distributors/${id}`;
export const DISTRIBUTOR_PRODUCTS_API = (id: string) =>
  `${API_URL}/distributors/${id}/products`;
export const DISTRIBUTOR_PRODUCT_DETAILS_API = (id: string) =>
  `${API_URL}/distributor-products/${id}`;

// Order APIs
export const CREATE_ORDER_API = `${API_URL}/orders`;

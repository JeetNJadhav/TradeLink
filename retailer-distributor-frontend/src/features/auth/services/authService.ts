import {
  CURRENT_USER_API,
  LOGIN_API,
  LOGOUT_API,
} from "../../../shared/api/api";
import apiClient from "../../../shared/api/apiClient";
import type { AuthResponse, AuthUser } from "../types";

export const login = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  const response = await apiClient.post<AuthResponse>(
    LOGIN_API,
    { email, password },
    { skipAuthRefresh: true },
  );
  return response.data.data.user;
};

// An expired access token is refreshed by apiClient, so this also restores a
// session on page load without rotating the refresh token when it is not needed.
export const getCurrentUser = async (
  signal?: AbortSignal,
): Promise<AuthUser> => {
  const response = await apiClient.get<AuthResponse>(CURRENT_USER_API, {
    signal,
  });
  return response.data.data.user;
};

export const logout = async (): Promise<void> => {
  await apiClient.post(LOGOUT_API, undefined, { skipAuthRefresh: true });
};

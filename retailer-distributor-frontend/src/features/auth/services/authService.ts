import {
  CURRENT_USER_API,
  LOGIN_API,
  LOGOUT_API,
} from "../../../shared/api/api";
import apiClient, { refreshAccessToken } from "../../../shared/api/apiClient";
import type { AuthResponse } from "../types";

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(LOGIN_API, {
    email,
    password,
  });
  return response.data;
};

export const refresh = async (): Promise<AuthResponse> => {
  await refreshAccessToken();
  const response = await apiClient.get<AuthResponse>(CURRENT_USER_API);
  return response.data;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>(CURRENT_USER_API);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post(LOGOUT_API);
};

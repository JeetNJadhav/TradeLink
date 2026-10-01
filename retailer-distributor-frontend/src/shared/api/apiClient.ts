import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "../config/env";
import { REFRESH_API } from "./api";
import { ApiError, toApiError } from "./ApiError";
import { emitSessionExpired } from "./authEvents";
import { getCsrfToken, isCsrfProtectedMethod, setCsrfToken } from "./csrf";

declare module "axios" {
  interface AxiosRequestConfig {
    // Set on requests that must not trigger a token refresh (login, refresh, logout).
    skipAuthRefresh?: boolean;
  }
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

const requestRefresh = async (): Promise<void> => {
  try {
    await apiClient.post(REFRESH_API, undefined, { skipAuthRefresh: true });
  } finally {
    refreshPromise = null;
  }
};

// Concurrent callers share one refresh so the refresh token is rotated only once.
const refreshAccessToken = (): Promise<void> => {
  refreshPromise ??= requestRefresh();
  return refreshPromise;
};

// A rejected refresh means the session is over; a network failure does not.
const refreshSession = async (): Promise<void> => {
  try {
    await refreshAccessToken();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setCsrfToken(null);
      emitSessionExpired();
    }
    throw error;
  }
};

apiClient.interceptors.request.use(async (config) => {
  if (!isCsrfProtectedMethod(config.method) || config.skipAuthRefresh) {
    return config;
  }

  // No token in memory and no readable cookie: a refresh returns a fresh one.
  if (!getCsrfToken()) await refreshSession();

  const csrfToken = getCsrfToken();
  if (csrfToken) config.headers.set(env.csrfHeaderName, csrfToken);

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const csrfToken = (response.data as { data?: { csrfToken?: unknown } })
      ?.data?.csrfToken;
    if (typeof csrfToken === "string") setCsrfToken(csrfToken);

    return response;
  },
  async (error: unknown) => {
    const config = axios.isAxiosError(error)
      ? (error.config as RetryableRequestConfig | undefined)
      : undefined;
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    // 401: the access token expired. 403 on a write: the CSRF token may have
    // been rotated by another tab. A refresh fixes both, so retry once.
    const isRecoverable =
      status === 401 ||
      (status === 403 && isCsrfProtectedMethod(config?.method));

    if (
      !isRecoverable ||
      !config ||
      config._retry ||
      config.skipAuthRefresh
    ) {
      throw toApiError(error);
    }

    config._retry = true;
    await refreshSession();
    return apiClient.request(config);
  },
);

export default apiClient;

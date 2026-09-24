import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { LOGIN_API, LOGOUT_API, REFRESH_API } from "./api";

const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME || "csrfToken";
const CSRF_HEADER_NAME =
  import.meta.env.VITE_CSRF_HEADER_NAME || "x-csrf-token";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const readCookie = (name: string): string | null => {
  const encodedName = encodeURIComponent(name);
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${encodedName}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.substring(encodedName.length + 1));
};

const isCsrfProtectedMethod = (method?: string) =>
  ["post", "put", "patch", "delete"].includes(method?.toLowerCase() ?? "");

const apiClient: AxiosInstance = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

export const refreshAccessToken = (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(REFRESH_API, undefined, {
        withCredentials: true,
        headers: getCsrfHeaders(),
      })
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};
const getCsrfHeaders = (): Record<string, string> => {
  const csrfToken = readCookie(CSRF_COOKIE_NAME);
  return csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {};
};

apiClient.interceptors.request.use((config) => {
  if (isCsrfProtectedMethod(config.method)) {
    const csrfHeaders = getCsrfHeaders();
    Object.entries(csrfHeaders).forEach(([name, value]) => {
      config.headers.set(name, value);
    });
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      config.url === REFRESH_API ||
      config.url === LOGIN_API ||
      config.url === LOGOUT_API
    ) {
      throw error;
    }

    config._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
      return apiClient.request(config);
    } catch (refreshError) {
      throw refreshError;
    }
  },
);

export default apiClient;

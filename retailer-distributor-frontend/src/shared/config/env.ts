// Single place where build-time configuration is read and validated.

const DEFAULT_SUGGESTION_DEBOUNCE_MS = 300;

const requireEnv = (name: string, value: string | undefined): string => {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

const nonNegativeNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const env = {
  // True under `npm run dev`, false in a production build.
  isDev: import.meta.env.DEV,
  apiUrl: requireEnv("VITE_API_URL", import.meta.env.VITE_API_URL).replace(
    /\/+$/,
    "",
  ),
  suggestionDebounceMs: nonNegativeNumber(
    import.meta.env.VITE_SUGGESTION_DEBOUNCE,
    DEFAULT_SUGGESTION_DEBOUNCE_MS,
  ),
  csrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME || "csrfToken",
  csrfHeaderName: import.meta.env.VITE_CSRF_HEADER_NAME || "x-csrf-token",
} as const;

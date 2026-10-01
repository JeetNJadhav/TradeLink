import { env } from "../config/env";

// Latest token returned in a login/refresh response body. Only a fallback for
// when the browser will not let us read the cookie (API on another site).
let csrfToken: string | null = null;

const readCookie = (name: string): string | null => {
  const encodedName = encodeURIComponent(name);
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${encodedName}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.substring(encodedName.length + 1));
};

export const setCsrfToken = (token: string | null) => {
  csrfToken = token;
};

// The cookie wins because another tab may have rotated the token since.
export const getCsrfToken = (): string | null =>
  readCookie(env.csrfCookieName) ?? csrfToken;

export const isCsrfProtectedMethod = (method?: string) =>
  ["post", "put", "patch", "delete"].includes(method?.toLowerCase() ?? "");

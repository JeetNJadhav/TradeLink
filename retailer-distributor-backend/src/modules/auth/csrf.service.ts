import crypto from "node:crypto";

export const generateCsrfToken = (): string =>
  crypto.randomBytes(32).toString("hex");

// Double-submit check: the token in the cookie must match the one in the header.
export const isValidCsrfToken = (
  cookieToken: string | undefined,
  headerToken: string | undefined,
): boolean => !!cookieToken && !!headerToken && cookieToken === headerToken;

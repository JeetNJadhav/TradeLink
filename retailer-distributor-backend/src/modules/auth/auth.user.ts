import type { UserRecord } from "./auth.types";

// Emails are stored lowercase.
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

// The user fields that are safe to send to the client.
export const toPublicUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  organizationName: user.organizationName,
});

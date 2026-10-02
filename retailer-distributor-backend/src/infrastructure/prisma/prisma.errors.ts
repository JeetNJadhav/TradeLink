import { Prisma } from "../../generated/prisma/client";

// P2002: a write broke a unique constraint, e.g. a second user with the same email.
export const isUniqueViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

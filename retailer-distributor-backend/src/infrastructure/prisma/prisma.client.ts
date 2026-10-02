import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../generated/prisma/client";
import { env } from "../../config/env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});

// What a repository needs to run queries: the root client, or the client of an open transaction.
export type PrismaDb = PrismaClient | Prisma.TransactionClient;

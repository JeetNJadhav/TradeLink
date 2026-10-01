import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({
  adapter,
});

// What a repository needs to run queries: the root client, or the client of an open transaction.
export type PrismaDb = PrismaClient | Prisma.TransactionClient;

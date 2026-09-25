import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting User.role backfill...");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Safety check: a user must not belong to both roles.
    const conflicts = await tx.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count
      FROM "User" u
      INNER JOIN "Retailer" r ON r."userId" = u.id
      INNER JOIN "Distributor" d ON d."userId" = u.id
    `;

    if (Number(conflicts[0].count) > 0) {
      throw new Error(
        "Backfill stopped: some users belong to both Retailer and Distributor.",
      );
    }

    // 2. Assign RETAILER.
    const retailers = await tx.$executeRaw`
      UPDATE "User" u
      SET "role" = 'RETAILER'::"UserRole"
      FROM "Retailer" r
      WHERE r."userId" = u.id
        AND u."role" IS NULL
    `;

    // 3. Assign DISTRIBUTOR.
    const distributors = await tx.$executeRaw`
      UPDATE "User" u
      SET "role" = 'DISTRIBUTOR'::"UserRole"
      FROM "Distributor" d
      WHERE d."userId" = u.id
        AND u."role" IS NULL
    `;

    // 4. Safety check: every existing user must now have a role.
    const unassigned = await tx.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count
      FROM "User"
      WHERE "role" IS NULL
    `;

    if (Number(unassigned[0].count) > 0) {
      throw new Error(
        `Backfill stopped: ${unassigned[0].count} user(s) could not be assigned a role.`,
      );
    }

    return {
      retailers,
      distributors,
    };
  });

  console.log(`RETAILER users updated: ${result.retailers}`);
  console.log(`DISTRIBUTOR users updated: ${result.distributors}`);
  console.log("User.role backfill completed successfully.");
}

main()
  .catch((error) => {
    console.error("User.role backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RETAILER', 'DISTRIBUTOR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole";

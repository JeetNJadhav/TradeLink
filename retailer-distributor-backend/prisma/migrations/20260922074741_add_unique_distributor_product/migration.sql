/*
  Warnings:

  - A unique constraint covering the columns `[distributorId,productId]` on the table `DistributorProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DistributorProduct_distributorId_productId_key" ON "DistributorProduct"("distributorId", "productId");

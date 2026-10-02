-- CreateIndex
CREATE INDEX "DistributorProduct_productId_idx" ON "DistributorProduct"("productId");

-- CreateIndex
CREATE INDEX "Order_retailerId_idx" ON "Order"("retailerId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_distributorProductId_idx" ON "OrderItem"("distributorProductId");

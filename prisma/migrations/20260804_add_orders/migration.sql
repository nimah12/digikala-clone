CREATE TABLE "Order" (id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', total INTEGER NOT NULL, "shippingName" TEXT NOT NULL, "shippingPrice" INTEGER NOT NULL, "receiverName" TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now());
CREATE TABLE "OrderItem" (id SERIAL PRIMARY KEY, "orderId" INTEGER NOT NULL, "productId" INTEGER NOT NULL, quantity INTEGER NOT NULL DEFAULT 1, price INTEGER NOT NULL);
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

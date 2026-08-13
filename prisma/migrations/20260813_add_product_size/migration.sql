-- جدول سایزهای محصول (مثل S/M/L یا ۳۸/۴۰/۴۲) + فیلد سایز روی اقلام سفارش

CREATE TABLE IF NOT EXISTS "ProductSize" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ProductSize_productId_idx') THEN
        CREATE INDEX "ProductSize_productId_idx" ON "ProductSize"("productId");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductSize_productId_fkey') THEN
        ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'OrderItem' AND column_name = 'sizeName') THEN
        ALTER TABLE "OrderItem" ADD COLUMN "sizeName" TEXT;
    END IF;
END $$;

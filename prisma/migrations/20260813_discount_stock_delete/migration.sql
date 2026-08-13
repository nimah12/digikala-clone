-- سیستم تخفیف: قیمت اصلی (قبل از تخفیف) روی محصول ذخیره می‌شود
ALTER TABLE "Product" ADD COLUMN "originalPrice" INTEGER;

-- بک‌فیل برای محصولات فعلی: قیمت اصلی = قیمت نهایی ÷ (۱ - ٪تخفیف)
UPDATE "Product"
SET "originalPrice" = CAST(ROUND("price" * 100.0 / (100 - "discountPercent")) AS INTEGER)
WHERE "discountPercent" > 0 AND "discountPercent" < 100;

-- حذف کامل محصول: اقلام سفارش باید بدون وابستگی به محصول زنده بمانند
ALTER TABLE "OrderItem" ADD COLUMN "productName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "productSlug" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "productImageUrl" TEXT;

-- بک‌فیل snapshot از محصولات فعلی
UPDATE "OrderItem" oi
SET
  "productName" = p.name,
  "productSlug" = p.slug,
  "productImageUrl" = p."imageUrl"
FROM "Product" p
WHERE oi."productId" = p.id;

ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

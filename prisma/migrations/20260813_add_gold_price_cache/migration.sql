-- جدول کش قیمت لحظه‌ای طلا و سکه (هر ۸ ساعت بروزرسانی می‌شود)
CREATE TABLE "GoldPriceCache" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoldPriceCache_pkey" PRIMARY KEY ("key")
);

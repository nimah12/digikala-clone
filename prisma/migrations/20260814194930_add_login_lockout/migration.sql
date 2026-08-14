-- اضافه کردن شمارنده‌ی تلاش‌های ناموفق ورود و زمان قفل موقت حساب
ALTER TABLE "User" ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMP(3);

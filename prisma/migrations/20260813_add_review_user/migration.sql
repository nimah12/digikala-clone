-- ثبت userId برای نظرات تا فقط خریدارانِ سفارش تحویل‌شده بتوانند دیدگاه ثبت کنند
-- و از دیدگاه تکراری جلوگیری شود

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Review' AND column_name = 'userId') THEN
        ALTER TABLE "Review" ADD COLUMN "userId" INTEGER;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Review_userId_idx') THEN
        CREATE INDEX "Review_userId_idx" ON "Review"("userId");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Review_userId_fkey') THEN
        ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

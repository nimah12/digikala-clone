-- AlterTable (idempotent: columns may already exist from a prior db push)
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "colorHex" TEXT,
ADD COLUMN IF NOT EXISTS "colorName" TEXT;

-- CreateTable MenuGroup
CREATE TABLE IF NOT EXISTS "MenuGroup" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT DEFAULT 'tag',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "MenuGroup_title_key" ON "MenuGroup"("title");

-- Ensure Category.parentId exists (the repo's early migrations are incomplete)
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" INTEGER;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_parentId_fkey') THEN
        ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");

-- Add mega-menu fields to Category
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "groupId" INTEGER;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "icon" TEXT DEFAULT 'tag';
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_groupId_fkey') THEN
        ALTER TABLE "Category" ADD CONSTRAINT "Category_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MenuGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "Category_groupId_idx" ON "Category"("groupId");

-- Category names are now unique per-parent. Replace the global unique.
DROP INDEX IF EXISTS "Category_name_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Category_parentId_name_key" ON "Category"("parentId", "name");

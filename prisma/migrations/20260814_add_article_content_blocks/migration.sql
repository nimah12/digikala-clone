-- افزودن فیلد ساختار چیدمان مقاله (پاراگراف‌ها + تصاویر بین متن)
ALTER TABLE "Article" ADD COLUMN "contentBlocks" JSONB;

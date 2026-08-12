// اسکریپت یک‌باره: بازآرایی ۲۱ دسته‌بندی مسطح موجود، دقیقاً مطابق
// همان ۱۰ گروه اصلی که هم‌اکنون در src/lib/categories.ts (مگامنو) تعریف شده.
// اجرا: npx tsx prisma/scripts/reorganize-categories.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function ensureRoot(name: string, slug: string): Promise<number> {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.category.create({ data: { name, slug, parentId: null } });
  console.log(`ساخته شد: ${name} (${slug})`);
  return created.id;
}

async function reparent(childSlugs: string[], parentId: number) {
  for (const slug of childSlugs) {
    const child = await prisma.category.findUnique({ where: { slug } });
    if (!child) {
      console.warn(`  ! دسته با slug="${slug}" پیدا نشد، رد شد`);
      continue;
    }
    if (child.parentId === parentId) continue;
    await prisma.category.update({ where: { id: child.id }, data: { parentId } });
    console.log(`  -> ${child.name} (${slug}) زیر دسته‌ی جدید رفت`);
  }
}

async function main() {
  console.log("شروع بازآرایی دسته‌بندی‌ها...\n");

  // ۱. کالای دیجیتال (گروه جدید)
  const digitalId = await ensureRoot("کالای دیجیتال", "digital-goods");
  await reparent(
    ["mobile", "laptop", "tablet", "smartwatch", "audio", "camera", "gpu", "computer-accessories"],
    digitalId
  );

  // ۲. خانه و آشپزخانه — از دسته‌ی موجود "home" به‌عنوان والد استفاده می‌شود (اسمش از قبل یکی است)
  const home = await prisma.category.findUnique({ where: { slug: "home" } });
  if (home) {
    await reparent(["home-appliances", "decor"], home.id);
  } else {
    console.warn('! دسته "home" پیدا نشد');
  }

  // ۳. مد و پوشاک (گروه جدید)
  const fashionGroupId = await ensureRoot("مد و پوشاک", "fashion-clothing");
  await reparent(["clothing", "fashion"], fashionGroupId);

  // ۴. زیبایی و سلامت — از دسته‌ی موجود "beauty" به‌عنوان والد استفاده می‌شود
  const beauty = await prisma.category.findUnique({ where: { slug: "beauty" } });
  if (beauty) {
    await reparent(["perfume"], beauty.id);
  } else {
    console.warn('! دسته "beauty" پیدا نشد');
  }

  // ۵. مادر و کودک (گروه جدید)
  const motherChildId = await ensureRoot("مادر و کودک", "mother-child");
  await reparent(["toys"], motherChildId);

  // ۶. ورزش و سفر، کتاب و لوازم تحریر، سوپرمارکت، طلا و نقره، ابزارآلات
  // این‌ها همین الان به‌تنهایی با اسم درست ریشه هستند؛ نیازی به تغییر نیست.

  console.log("\nبازآرایی تمام شد ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

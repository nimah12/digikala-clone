// بازآرایی یک‌باره‌ی دیتابیس به ساختار جدید مگامنو:
// گروه‌های منو (MenuGroup) + دسته‌های اصلی (Category ریشه) + ساب‌دسته‌ها (فرزندان).
//
// اجرا بعد از اعمال migration:
//   npx prisma migrate deploy
//   npx tsx prisma/scripts/reorganize-mega-menu.ts
//
// اسکریپت هم‌توان (idempotent) است؛ چند بار اجرا هم ضرری ندارد.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ساختار هدف: گروه‌های مگامنو با دسته‌های اصلیِ زیرمجموعه‌شان (دقیقاً مطابق
// src/lib/categories.ts) به‌همراه آیکون هر دسته.
const MEGA_MENU = [
  { title: "کالای دیجیتال", icon: "phone", categories: [
    ["mobile", "phone"], ["laptop", "laptop"], ["tablet", "tablet"],
    ["smartwatch", "watch"], ["audio", "headphones"], ["camera", "camera"],
    ["gpu", "gamepad"], ["computer-accessories", "monitor"],
  ]},
  { title: "خانه و آشپزخانه", icon: "home", categories: [
    ["home", "home"], ["home-appliances", "coffee"], ["decor", "lamp"],
  ]},
  { title: "مد و پوشاک", icon: "t-shirt", categories: [
    ["clothing", "shirt"], ["fashion", "t-shirt"],
  ]},
  { title: "زیبایی و سلامت", icon: "spray", categories: [
    ["beauty", "spray"], ["perfume", "sparkles"],
  ]},
  { title: "ورزش و سفر", icon: "shoe", categories: [["sports", "shoe"]] },
  { title: "کتاب و لوازم تحریر", icon: "book", categories: [["books", "book"]] },
  { title: "مادر و کودک", icon: "gift", categories: [["toys", "gift"]] },
  { title: "سوپرمارکت", icon: "basket", categories: [["supermarket", "basket"]] },
  { title: "طلا و نقره", icon: "coins", categories: [["gold-silver", "coins"]] },
  { title: "ابزارآلات", icon: "wrench", categories: [["tools", "wrench"]] },
  { title: "لوازم یدکی", icon: "car", categories: [["spare-parts", "car"]] },
];

// ریشه‌های قدیمی که در واقع «نام گروه» بوده‌اند و باید بعد از آزادسازی
// فرزندانشان حذف شوند.
const OLD_GROUP_ROOTS = ["digital-goods", "fashion-clothing", "mother-child"];

async function main() {
  console.log("شروع بازآرایی مگامنو...\n");

  for (const group of MEGA_MENU) {
    let menuGroup = await prisma.menuGroup.findUnique({
      where: { title: group.title },
    });
    if (!menuGroup) {
      menuGroup = await prisma.menuGroup.create({
        data: { title: group.title, icon: group.icon, order: 0 },
      });
      console.log(`گروه ساخته شد: ${group.title}`);
    } else if (menuGroup.icon !== group.icon) {
      menuGroup = await prisma.menuGroup.update({
        where: { id: menuGroup.id },
        data: { icon: group.icon },
      });
    }

    // ترتیب گروه‌ها مطابق ترتیب تعریف در این اسکریپت
    await prisma.menuGroup.update({
      where: { id: menuGroup.id },
      data: { order: MEGA_MENU.findIndex((g) => g.title === group.title) },
    });

    for (const [slug, icon] of group.categories) {
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) {
        console.warn(`  ! دسته با slug="${slug}" پیدا نشد (رد شد)`);
        continue;
      }
      if (cat.parentId !== null || cat.groupId !== menuGroup.id || cat.icon !== icon) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { parentId: null, groupId: menuGroup.id, icon },
        });
        console.log(`  -> ${cat.name} (${slug}) به ریشه/گروه «${group.title}» منتقل شد`);
      }
    }
  }

  // حذف ریشه‌های قدیمیِ شبیه گروه که دیگر دسته‌ای ندارند
  for (const slug of OLD_GROUP_ROOTS) {
    const old = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!old) continue;
    if (old._count.products > 0 || old._count.children > 0) {
      console.warn(`  ! ریشه‌ی قدیمی «${old.name}» (${slug}) هنوز فرزند/محصول دارد؛ نگه داشته شد`);
      continue;
    }
    await prisma.category.delete({ where: { id: old.id } });
    console.log(`ریشه‌ی قدیمی حذف شد: ${old.name} (${slug})`);
  }

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

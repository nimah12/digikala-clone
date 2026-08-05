import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// یک endpoint امن برای سینک دیتابیس (فقط در صورتی که SECRET درست باشد)
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "dk-seed-2026") {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    // بررسی اینکه دسته کتاب وجود دارد یا نه
    const books = await prisma.category.findUnique({ where: { slug: "books" } });
    if (books) {
      return Response.json({ success: true, message: "already seeded" });
    }

    // دسته‌های جدید
    const cats = [
      { name: 'لوازم خانگی', slug: 'home-appliances' },
      { name: 'کتاب و لوازم تحریر', slug: 'books' },
      { name: 'عطر و ادکلن', slug: 'perfume' },
      { name: 'اسباب‌بازی', slug: 'toys' },
      { name: 'دکوراتیو', slug: 'decor' },
    ];
    const catIds: Record<string, number> = {};
    for (const c of cats) {
      const created = await prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { name: c.name, slug: c.slug },
      });
      catIds[c.slug] = created.id;
    }

    return Response.json({ success: true, message: "categories created" });
  } catch (e) {
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
}

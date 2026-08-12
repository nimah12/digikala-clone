import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// دقیقاً همان ساختاری که getMegaMenu در src/lib/menu-server.ts برای هدر
// فروشگاه می‌سازد؛ تا ادمین ببیند چه چیزی واقعاً در سایت نمایش داده می‌شود.
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const groups = await prisma.menuGroup.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      icon: true,
      categories: {
        where: { parentId: null },
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          children: {
            orderBy: [{ order: "asc" }, { id: "asc" }],
            select: { id: true, name: true, slug: true },
          },
          subcategories: {
            orderBy: [{ id: "asc" }],
            select: { name: true, slug: true },
          },
        },
      },
    },
  });

  const menu = groups.map((g) => ({
    id: g.id,
    title: g.title,
    icon: g.icon || "tag",
    categories: g.categories.map((c) => {
      const merged: { name: string; slug: string; href: string; source: string }[] = [];
      const byName = new Set<string>();
      for (const child of c.children) {
        byName.add(child.name);
        merged.push({
          name: child.name,
          slug: child.slug,
          href: `/category/${c.slug}/${child.slug}`,
          source: "admin",
        });
      }
      for (const sub of c.subcategories) {
        if (!byName.has(sub.name)) {
          merged.push({
            name: sub.name,
            slug: sub.slug,
            href: `/category/${c.slug}/${sub.slug}`,
            source: "db",
          });
        }
      }
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || "tag",
        subcategories: merged,
      };
    }),
  }));

  return NextResponse.json({ menu });
}

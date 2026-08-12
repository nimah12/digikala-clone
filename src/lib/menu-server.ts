import "server-only";
import { prisma } from "@/lib/prisma";
import { MEGA_MENU, MEGA_MENU_GROUPS } from "@/lib/categories";
import type { IconName } from "@/components/Icon";

export type MenuSubcategory = { name: string; slug: string; href: string };
export type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  icon: IconName;
  subcategories: MenuSubcategory[];
};
export type MenuGroupForRender = {
  id: number;
  title: string;
  icon: IconName;
  categories: MenuCategory[];
};

/**
 * ساختار کامل مگامنو (گروه‌ها -> دسته‌های اصلی -> ساب‌دسته‌ها) که از دیتابیس
 * خونده می‌شه و پنل ادمین (/admin/groups و /admin/categories) دقیقاً همین
 * ساختار رو مدیریت می‌کنه.
 *
 * ساب‌دسته‌ها از دو منبع ساخته می‌شوند تا «همگام» با پنل ادمین و صفحات فروشگاه
 * بمانند:
 *  ۱) دسته‌های فرزند (Category با parentId) که در پنل ادمین ساخته می‌شوند
 *  ۲) رکوردهای مدل Subcategory (دارای تصویر) که در صفحات فروشگاه هم استفاده
 *     می‌شوند و توسط سیدها پر شده‌اند
 * این دو منبع بر اساس نام ادغام (merge) می‌شوند تا تکراری نمایش داده نشود.
 *
 * اگه دیتابیس در دسترس نباشه یا گروهی تعریف نشده باشه، به‌عنوان fallback
 * از کانفیگ استاتیک قدیمی (src/lib/categories.ts) استفاده می‌شه تا صفحه
 * همیشه بدون خطا رندر بشه.
 */
export async function getMegaMenu(): Promise<MenuGroupForRender[]> {
  try {
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

    if (groups.length === 0) return staticMenuFallback();

    return groups.map((g) => ({
      id: g.id,
      title: g.title,
      icon: (g.icon as IconName) || "tag",
      categories: g.categories.map((c) => {
        // ادغام فرزندان دسته (مدیریت‌شده در پنل ادمین) با ساب‌دسته‌های مدل
        // Subcategory؛ بر اساس نام، بدون تکرار.
        const merged = new Map<string, MenuSubcategory>();
        for (const child of c.children) {
          merged.set(child.name, {
            name: child.name,
            slug: child.slug,
            href: `/category/${c.slug}/${child.slug}`,
          });
        }
        for (const sub of c.subcategories) {
          if (!merged.has(sub.name)) {
            merged.set(sub.name, {
              name: sub.name,
              slug: sub.slug,
              href: `/category/${c.slug}/${sub.slug}`,
            });
          }
        }
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: (c.icon as IconName) || "tag",
          subcategories: Array.from(merged.values()),
        };
      }),
    }));
  } catch {
    return staticMenuFallback();
  }
}

function staticMenuFallback(): MenuGroupForRender[] {
  return MEGA_MENU_GROUPS.map((group, gi) => ({
    id: -(gi + 1),
    title: group.title,
    icon: group.icon,
    categories: group.items.map((section, si) => {
      const full = MEGA_MENU.find((s) => s.slug === section.slug);
      return {
        id: -(si + 1),
        name: section.name,
        slug: section.slug,
        icon: section.icon,
        subcategories: (full?.subcategories ?? []).map((name) => ({
          name,
          slug: name,
          href: `/search?q=${encodeURIComponent(name)}`,
        })),
      };
    }),
  }));
}

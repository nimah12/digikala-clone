import { prisma } from "@/lib/prisma";
import { getGoldPrices } from "@/lib/gold-prices";
import { isWinterClothing, summerBoost } from "@/lib/clothing";
import type { HeroSlide, HeroProduct, GoldItem } from "@/components/HeroSlider";

const DAY_MS = 24 * 60 * 60 * 1000;
const HERO_WINDOW = 6;

type ProductRow = {
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  category: { name: string; slug: string } | null;
};

function toHeroProduct(p: ProductRow): HeroProduct {
  return {
    name: p.name,
    imageUrl: p.imageUrl,
    price: p.price,
    originalPrice: p.originalPrice,
    discountPercent: p.discountPercent,
    categoryName: p.category?.name ?? "",
  };
}

/** پنجره‌ای از آرایه که هر روز با یک نقطه شروع متفاوت برمی‌گردد (چرخش روزانه) */
function rotateWindow<T>(arr: T[], day: number, size: number): T[] {
  if (arr.length <= size) return arr;
  const start = day % arr.length;
  const out: T[] = [];
  for (let i = 0; i < size; i++) {
    out.push(arr[(start + i) % arr.length]);
  }
  return out;
}

const HERO_THEMES: HeroSlide["theme"][] = [
  "deals",
  "laptop",
  "smartwatch",
  "audio",
  "gold",
];

/**
 * اسلایدهای هیرو را می‌سازد:
 * - محصولات تخفیف‌دار با عکس واقعی (هر روز یک پنجره متفاوت)
 * - اسلاید طلا و سکه با قیمت لحظه‌ای ناواسان (کش ۸ ساعته)
 * هم صفحهٔ اصلی (SSR) و هم /api/hero از همین تابع استفاده می‌کنند.
 */
export async function buildHeroSlides(): Promise<HeroSlide[]> {
  const [pool, gold] = await Promise.all([
    prisma.product.findMany({
      where: {
        discountPercent: { gt: 0 },
        imageUrl: { not: { contains: "/images/" } },
      },
      include: { category: true },
      orderBy: { discountPercent: "desc" },
      take: 30,
    }),
    getGoldPrices(),
  ]);

  const dayNum = Math.floor(Date.now() / DAY_MS);

  // حذف پوشاک زمستانی (هودی و...) از هیرو + اولویت با آیتم‌های تابستانی
  const summerPool = [...pool]
    .filter((p) => !isWinterClothing(p.name))
    .sort(
      (a, b) =>
        summerBoost(b.name) - summerBoost(a.name) ||
        b.discountPercent - a.discountPercent,
    );

  let heroProducts = rotateWindow(summerPool, dayNum, HERO_WINDOW);
  if (!heroProducts.length) {
    const fallback = await prisma.product.findMany({
      where: { discountPercent: { gt: 0 } },
      include: { category: true },
      orderBy: { discountPercent: "desc" },
      take: HERO_WINDOW,
    });
    heroProducts = fallback;
  }

  const productSlides: HeroSlide[] = heroProducts.map((product, idx) => {
    const theme: HeroSlide["theme"] = HERO_THEMES[idx % HERO_THEMES.length];
    return {
      id: `p-${product.id}`,
      badge: `تا ٪${product.discountPercent.toLocaleString("fa-IR")} تخفیف`,
      title: product.name,
      subtitle: `${product.category?.name ?? "کالای منتخب"} با ضمانت اصالت و ارسال سریع`,
      stats: `${heroProducts.length.toLocaleString("fa-IR")} کالای منتخب با تخفیف ویژه`,
      href: `/product/${product.slug}`,
      theme,
      product: toHeroProduct(product),
    };
  });

  // ---- اسلاید طلا و سکه ----
  const goldItems: GoldItem[] = [];
  const push = (name: string, price: number | null, changeKey: string) => {
    if (!price || price <= 0) return;
    const change = gold.change[changeKey] ?? 0;
    const changePercent =
      price - change > 0 ? (change / (price - change)) * 100 : 0;
    goldItems.push({ name, price, change, changePercent });
  };
  // پنل هیرو فشرده: ۵ آیتم اصلی (بقیه در صفحه قیمت روز طلا)
  push("طلای ۱۸ عیار (گرم)", gold.gold18k, "gold18k");
  push("سکه امامی", gold.sekkeh, "sekkeh");
  push("ربع سکه", gold.rob, "rob");
  push("نیم سکه", gold.nim, "nim");
  push("دلار آمریکا", gold.usd, "usd");

  // fallback: اگر ناواسان در دسترس نبود، قیمت محصولات طلای فروشگاه
  if (!goldItems.length) {
    const dbGold = await prisma.product.findMany({
      where: { category: { slug: "gold-silver" } },
      orderBy: { salesCount: "desc" },
      take: 4,
    });
    dbGold.forEach((gp) =>
      goldItems.push({ name: gp.name, price: gp.price, change: 0, changePercent: 0 }),
    );
  }

  const goldSlide: HeroSlide = {
    id: "gold-live",
    badge: "قیمت لحظه‌ای",
    title: "طلا و سکه",
    subtitle: "قیمت روز طلا، سکه و ارز با ضمانت اصالت و عیار تضمینی",
    stats: "بروزرسانی هر ۸ ساعت",
    href: "/category/gold-silver",
    secondaryHref: "/gold-price",
    theme: "gold",
    product: null,
    goldItems,
    goldUpdatedAt: gold.date ?? undefined,
  };

  return goldItems.length
    ? [productSlides[0], goldSlide, ...productSlides.slice(1)]
    : productSlides;
}

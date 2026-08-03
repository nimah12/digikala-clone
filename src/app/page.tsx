import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import ArticleCard from "@/components/ArticleCard";
import { ARTICLES } from "@/lib/articles";

export const revalidate = 60;

const SERVICES = [
  { icon: "🚚", label: "تحویل اکسپرس" },
  { icon: "💵", label: "پرداخت در محل" },
  { icon: "✅", label: "ضمانت اصالت کالا" },
  { icon: "↩️", label: "۷ روز ضمانت بازگشت" },
  { icon: "📦", label: "ارسال رایگان" },
];

export default async function Home() {
  const [deals, bestSellers, newest] = await Promise.all([
    prisma.product.findMany({
      where: { discountPercent: { gt: 0 } },
      include: { category: true },
      orderBy: { discountPercent: "desc" },
      take: 12,
    }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero slider */}
      <section className="mb-8">
        <HeroSlider />
      </section>

      {/* Service icons strip */}
      <section className="mb-8">
        <div
          className="rounded-2xl border p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          {SERVICES.map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* شگفت‌انگیزها: discounted products */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <span className="text-dk-red text-2xl">⚡</span>
            شگفت‌انگیزها
          </h2>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {deals.length.toLocaleString("fa-IR")} کالا با تخفیف ویژه
          </span>
        </div>
        <div className="scroll-row flex gap-3">
          {deals.map((product) => (
            <div key={product.id} className="w-44 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* پرفروش‌ترین‌ها */}
      <section className="mb-10">
        <h2 className="text-lg font-extrabold mb-4">پرفروش‌ترین‌ها</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* جدیدترین‌ها */}
      <section className="mb-10">
        <h2 className="text-lg font-extrabold mb-4">جدیدترین‌ها</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {newest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* مقالات و اخبار */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold">مقالات و اخبار دنیای تکنولوژی</h2>
          <Link
            href="/articles"
            className="text-xs font-bold text-dk-red hover:underline"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}

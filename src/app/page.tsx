import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { type ProductWithCategory } from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import ArticleCard from "@/components/ArticleCard";
import ServiceStrip from "@/components/ServiceStrip";
import CategoryCircles from "@/components/CategoryCircles";
import PromoBanners from "@/components/PromoBanners";
import PopularBrands from "@/components/PopularBrands";
import ProductRow from "@/components/ProductRow";
import Icon from "@/components/Icon";
import { ARTICLES } from "@/lib/articles";

export const dynamic = "force-dynamic";

type RowProduct = ProductWithCategory;

export default async function Home() {
  const [
    deals,
    bestSellers,
    newest,
    gpu,
    clothing,
    gold,
    appliances,
    books,
    perfume,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { discountPercent: { gt: 0 } },
      include: { category: true },
      orderBy: { discountPercent: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      where: { category: { slug: "gpu" } },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      where: { category: { slug: "clothing" } },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      where: { category: { slug: "gold-silver" } },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      where: { category: { slug: "home-appliances" } },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      where: { category: { slug: "books" } },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 14,
    }),
    prisma.product.findMany({
      where: { category: { slug: "perfume" } },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 14,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero slider */}
      <section className="mb-8">
        <HeroSlider />
      </section>

      {/* Service icons strip */}
      <ServiceStrip />

      {/* Category circles */}
      <CategoryCircles />

      {/* Promo banners */}
      <PromoBanners />

      {/* Popular brands */}
      <PopularBrands />

      {/* شگفت‌انگیزها: discounted products */}
      <ProductRow
        icon="bolt"
        title="شگفت‌انگیزها"
        subtitle="کالاهای منتخب با تخفیف ویژه"
        products={deals as RowProduct[]}
        headerBg="#ef4050"
        headerColor="#ffffff"
      />

      {/* پرفروش‌ترین‌ها */}
      <ProductRow
        icon="flame"
        title="پرفروش‌ترین‌ها"
        subtitle="محبوب‌ترین کالاهای دیجی‌کلون"
        products={bestSellers as RowProduct[]}
        headerBg="#23254e"
        headerColor="#ffffff"
      />

      {/* کارت گرافیک و گیمینگ */}
      <ProductRow
        icon="gamepad"
        title="کارت گرافیک و گیمینگ"
        subtitle="قدرت برای بازی و رندرینگ"
        products={gpu as RowProduct[]}
      />

      {/* پوشاک */}
      <ProductRow
        icon="shirt"
        title="پوشاک"
        subtitle="نایک، لی، اسکچرز و بیشتر"
        products={clothing as RowProduct[]}
      />

      {/* طلا و نقره */}
      <ProductRow
        icon="coins"
        title="طلا و نقره"
        subtitle="با عیار تضمینی و کد اصالت"
        products={gold as RowProduct[]}
      />

      {/* لوازم خانگی */}
      <ProductRow
        icon="coffee"
        title="لوازم خانگی"
        subtitle="قهوه‌ساز، سرخ‌کن و بیشتر"
        products={appliances as RowProduct[]}
      />

      {/* کتاب */}
      <ProductRow
        icon="book"
        title="کتاب و لوازم تحریر"
        subtitle="جدیدترین کتاب‌های پرفروش"
        products={books as RowProduct[]}
      />

      {/* عطر */}
      <ProductRow
        icon="spray"
        title="عطر و ادکلن"
        subtitle="رایحه‌های ماندگار"
        products={perfume as RowProduct[]}
      />

      {/* جدیدترین‌ها */}
      <ProductRow
        icon="sparkles"
        title="جدیدترین‌ها"
        subtitle="تازه‌های فروشگاه"
        products={newest as RowProduct[]}
      />

      {/* مقالات و اخبار */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <Icon name="newspaper" size={20} className="text-dk-red" />
            مقالات و اخبار دنیای تکنولوژی
          </h2>
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

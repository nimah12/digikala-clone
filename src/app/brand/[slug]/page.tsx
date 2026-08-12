import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Icon, { type IconName } from "@/components/Icon";

export const dynamic = "force-dynamic";

const BRANDS: Record<
  string,
  { name: string; icon: IconName; keywords: string[] }
> = {
  apple: {
    name: "اپل",
    icon: "monitor",
    keywords: [
      "iphone",
      "airpod",
      "ipad",
      "macbook",
      "mac",
      "homepod",
      "apple",
    ],
  },
  samsung: { name: "سامسونگ", icon: "phone", keywords: ["samsung", "galaxy"] },
  xiaomi: {
    name: "شیائومی",
    icon: "tag",
    keywords: ["xiaomi", "redmi", "mi-"],
  },
  lenovo: {
    name: "لنوو",
    icon: "laptop",
    keywords: ["lenovo", "thinkpad", "ideapad", "legion"],
  },
  nike: { name: "نایک", icon: "shoe", keywords: ["nike"] },
  adidas: { name: "آدیداس", icon: "t-shirt", keywords: ["adidas"] },
  sony: { name: "سونی", icon: "headphones", keywords: ["sony", "ps4", "ps5"] },
  bosch: { name: "بوش", icon: "wrench", keywords: ["bosch"] },
  jbl: { name: "جی‌بی‌ال", icon: "megaphone", keywords: ["jbl"] },
  asus: {
    name: "ایسوس",
    icon: "gamepad",
    keywords: ["asus", "rog", "vivobook"],
  },
  tefal: { name: "تفال", icon: "pan", keywords: ["tefal"] },
  panasonic: { name: "پاناسونیک", icon: "tv", keywords: ["panasonic"] },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = BRANDS[slug];
  return { title: brand ? `محصولات ${brand.name}` : "برند یافت نشد" };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = BRANDS[slug];

  if (!brand) notFound();

  // محصولاتی که slug یا نامش شامل کلمه کلیدی برند است
  const products = await prisma.product.findMany({
    where: {
      OR: brand.keywords.map((kw) => ({
        OR: [
          { name: { contains: kw, mode: "insensitive" } },
          { slug: { contains: kw } },
        ],
      })),
    },
    include: { category: true },
    orderBy: { salesCount: "desc" },
    take: 30,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <span
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg)", color: "#23254e" }}
        >
          <Icon name={brand.icon} size={30} strokeWidth={1.5} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">محصولات {brand.name}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {products.length.toLocaleString("fa-IR")} کالا
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <p
          className="text-sm py-16 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          هنوز محصولی برای این برند ثبت نشده است.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

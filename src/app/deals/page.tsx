import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductListing from "@/components/ProductListing";
import type { ProductWithCategory } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "تخفیف‌های شگفت‌انگیز" };

export default async function DealsPage() {
  const products = await prisma.product.findMany({
    where: { discountPercent: { gt: 0 } },
    include: { category: true },
    orderBy: [{ discountPercent: "desc" }, { salesCount: "desc" }],
    take: 60,
  });

  return (
    <ProductListing
      icon="bolt"
      title="تخفیف‌های شگفت‌انگیز"
      subtitle="کالاهای منتخب با تخفیف ویژه، فقط برای مدت محدود"
      products={products as ProductWithCategory[]}
    />
  );
}

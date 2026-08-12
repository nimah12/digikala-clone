import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductListing from "@/components/ProductListing";
import type { ProductWithCategory } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "پرفروش‌ترین محصولات" };

export default async function BestsellersPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { salesCount: "desc" },
    take: 60,
  });

  return (
    <ProductListing
      icon="flame"
      title="پرفروش‌ترین محصولات"
      subtitle="محبوب‌ترین کالاهای دیجی‌کلون بر اساس تعداد فروش"
      products={products as ProductWithCategory[]}
    />
  );
}

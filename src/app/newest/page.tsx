import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductListing from "@/components/ProductListing";
import type { ProductWithCategory } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "جدیدترین محصولات" };

export default async function NewestPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <ProductListing
      icon="sparkles"
      title="جدیدترین محصولات"
      subtitle="تازه‌های فروشگاه"
      products={products as ProductWithCategory[]}
    />
  );
}

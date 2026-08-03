import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard, { type ProductWithCategory } from "@/components/ProductCard";

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export const metadata: Metadata = { title: "جستجو" };

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] : (params.q ?? "");

  let results: ProductWithCategory[] = [];
  if (q.trim()) {
    results = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { slug: { contains: q.toLowerCase(), mode: "insensitive" } },
        ],
      },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: 50,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-extrabold mb-4">
        نتایج جستجو برای «{q}»
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          {" "}
          ({results.length.toLocaleString("fa-IR")} کالا)
        </span>
      </h1>

      {!q.trim() ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--text-secondary)" }}>
          عبارت مورد نظر خود را در جستجو وارد کنید.
        </p>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            کالایی با نام «{q}» پیدا نشد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

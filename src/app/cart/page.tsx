import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCartProductIds } from "@/lib/cart";
import RemoveFromCartButton from "@/components/RemoveFromCartButton";
import { formatPrice } from "@/lib/format";

export default async function CartPage() {
  const ids = await getCartProductIds();

  if (ids.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-xl font-extrabold mb-2">سبد خرید شما خالی است</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          برای دیدن محصولات جذاب به فروشگاه برگردید
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true },
  });

  const productById = new Map(products.map((p) => [p.id, p]));
  const items = ids.map((id) => productById.get(id)).filter((p) => p !== undefined);

  const total = items.reduce((sum, p) => sum + p!.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-extrabold mb-4">
        سبد خرید{" "}
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          ({items.length.toLocaleString("fa-IR")} کالا)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((product) => (
            <div
              key={product!.id}
              className="rounded-2xl border p-4 flex items-center gap-4"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              <Link href={`/product/${product!.slug}`} className="shrink-0">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden" style={{ background: "var(--bg)" }}>
                  <Image
                    src={product!.imageUrl || "/images/placeholder.svg"}
                    alt={product!.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${product!.slug}`} className="block text-sm font-bold mb-1 truncate hover:text-dk-red transition-colors">
                  {product!.name}
                </Link>
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {product!.category.name}
                </span>
              </div>
              <div className="text-left shrink-0">
                <div className="text-sm font-bold digits">{formatPrice(product!.price)}</div>
                <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>تومان</div>
              </div>
              <RemoveFromCartButton productId={product!.id} />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-2xl border p-4 h-fit" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>مجموع کالاها</span>
            <span className="text-sm font-bold digits">{total.toLocaleString("fa-IR")} تومان</span>
          </div>
          <div className="flex items-center justify-between mb-4 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span>هزینه ارسال</span>
            <span className="text-dk-green font-bold">رایگان</span>
          </div>
          <div className="border-t pt-4 flex items-center justify-between mb-4" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-bold">مبلغ قابل پرداخت</span>
            <span className="text-lg font-extrabold digits">
              {formatPrice(total)} <span className="text-xs" style={{ color: "var(--text-secondary)" }}>تومان</span>
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center h-11 leading-[44px] rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            ادامه فرآیند خرید
          </Link>
          <Link
            href="/"
            className="block text-center text-xs hover:text-dk-red transition-colors mt-3"
            style={{ color: "var(--text-secondary)" }}
          >
            ادامه خرید از فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}

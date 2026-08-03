import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCartProductIds } from "@/lib/cart";
import CheckoutForm from "@/components/CheckoutForm";
import { formatPrice } from "@/lib/format";

export default async function CheckoutPage() {
  const ids = await getCartProductIds();

  if (ids.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-xl font-extrabold mb-2">سبد خرید شما خالی است</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          برای تکمیل فرآیند خرید، ابتدا محصولی به سبد اضافه کنید.
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
  const subtotal = items.reduce((sum, p) => sum + p!.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        <Link href="/" className="hover:text-dk-red">خانه</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-dk-red">سبد خرید</Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>تسویه حساب</span>
      </nav>

      <h1 className="text-lg font-extrabold mb-4">تسویه حساب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Checkout form */}
        <div className="lg:col-span-2">
          <CheckoutForm subtotal={subtotal} />
        </div>

        {/* Order summary */}
        <div className="rounded-2xl border p-4 h-fit" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <h2 className="text-sm font-extrabold mb-4">خلاصه سفارش</h2>
          <div className="space-y-3 mb-4">
            {items.map((p) => (
              <div key={p!.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg)" }}>
                  <Image
                    src={p!.imageUrl || "/images/placeholder.svg"}
                    alt={p!.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{p!.name}</div>
                </div>
                <div className="text-xs font-bold digits shrink-0">{formatPrice(p!.price)}</div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-xs" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>جمع کالاها</span>
              <span className="digits">{formatPrice(subtotal)} تومان</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>هزینه ارسال</span>
              <span className="digits" style={{ color: "var(--text-secondary)" }}>در مرحله بعد</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-extrabold">
              <span>مبلغ قابل پرداخت</span>
              <span className="digits">{formatPrice(subtotal)} تومان</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

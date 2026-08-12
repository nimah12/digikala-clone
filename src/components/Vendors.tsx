import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import Icon from "./Icon";

export default async function Vendors({ productId }: { productId: number }) {
  const vendors = await prisma.vendor.findMany({
    where: { productId },
    orderBy: { price: "asc" },
  });

  if (vendors.length === 0) return null;

  return (
    <section
      className="mt-8 rounded-2xl border p-4 md:p-6"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      <h2 className="text-lg font-extrabold mb-1">فروشندگان این محصول</h2>
      <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
        برای خرید، نزدیک‌ترین فروشگاه محلی را انتخاب کنید
      </p>

      <div className="space-y-3">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="flex items-start gap-4 p-4 rounded-xl border"
            style={{ borderColor: "var(--border)" }}
          >
            {/* Shop avatar */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--bg)", color: "var(--text-secondary)" }}
            >
              <Icon name="basket" size={22} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold truncate">{v.name}</div>
                {/* Rating */}
                <div className="flex items-center gap-1 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f9a825" aria-hidden="true">
                    <path d="M12 2l2.9 6.26 6.85.83-5.06 4.68 1.33 6.77L12 17.2 5.98 20.54l1.33-6.77L2.25 9.09l6.85-.83L12 2z" />
                  </svg>
                  <span className="text-xs font-bold digits">{v.rating.toFixed(1).replace(".", "٫")}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>امتیاز</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {v.city}
                </span>
                <span className="truncate">{v.address}</span>
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }} dir="ltr">
                {v.phone}
              </div>
            </div>

            {/* Price + stock */}
            <div className="text-left shrink-0">
              <div className="text-sm font-bold digits" style={{ color: "var(--dk-red, #ef4050)" }}>
                {formatPrice(v.price)}
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>تومان</div>
              <div className="text-[10px] mt-1 font-bold" style={{ color: v.stock > 0 ? "#2ab57d" : "#ef4050" }}>
                {v.stock > 0 ? `${v.stock.toLocaleString("fa-IR")} عدد در انبار` : "ناموجود"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

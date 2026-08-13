import Link from "next/link";
import { getGoldPrices } from "@/lib/gold-prices";
import { formatPrice } from "@/lib/format";
import Icon from "@/components/Icon";
import GoldPriceChart from "@/components/GoldPriceChart";

export const dynamic = "force-dynamic";

type Row = {
  name: string;
  icon: string;
  price: number | null;
  change: number;
  changePercent: number;
  kind: "coin" | "fx"; // ارز (دلار) جدا از طلا و سکه
};

function buildRows(g: Awaited<ReturnType<typeof getGoldPrices>>): Row[] {
  const rows: Row[] = [];
  const push = (name: string, icon: string, price: number | null, key: string, kind: "coin" | "fx" = "coin") => {
    const change = g.change[key] ?? 0;
    const changePercent = price && price - change > 0 ? (change / (price - change)) * 100 : 0;
    rows.push({ name, icon, price, change, changePercent, kind });
  };
  push("طلای ۱۸ عیار (گرم)", "coins", g.gold18k, "gold18k");
  push("سکه امامی", "coins", g.sekkeh, "sekkeh");
  push("سکه بهار آزادی", "coins", g.bahar, "bahar");
  push("نیم سکه", "coins", g.nim, "nim");
  push("ربع سکه", "coins", g.rob, "rob");
  push("سکه گرمی", "coins", g.gerami, "gerami");
  push("دلار آمریکا", "banknote", g.usd, "usd", "fx");
  return rows;
}

export default async function GoldPricePage() {
  const gold = await getGoldPrices();
  const rows = buildRows(gold);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black flex items-center justify-center gap-2">
          <Icon name="coins" size={26} className="text-dk-red" />
          قیمت روز طلا و سکه
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
          نرخ لحظه‌ای طلا، سکه و ارز
        </p>
      </div>

      {/* نمودار تغییرات ۳۰ روزه */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="chart-line" size={18} className="text-dk-red" />
          <h2 className="text-base md:text-lg font-black">نمودار تغییرات قیمت (۳۰ روز)</h2>
        </div>
        <GoldPriceChart history={gold.history ?? []} />
      </div>

      {/* جدول قیمت‌ها */}
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div
          className="px-5 py-3 text-sm font-bold border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <span>آخرین بروزرسانی: {gold.date ?? "—"}</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>واحد: تومان</span>
        </div>

        {rows.map((row) => {
          const isFx = row.kind === "fx";
          return (
          <div
            key={row.name}
            className="flex items-center justify-between gap-3 px-5 py-4 border-b last:border-0"
            style={{
              borderColor: "var(--border)",
              background: isFx ? "color-mix(in srgb, #22a7f0 7%, transparent)" : undefined,
              boxShadow: isFx ? "inset 3px 0 0 #22a7f0" : undefined,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: isFx
                    ? "color-mix(in srgb, #22a7f0 15%, transparent)"
                    : "color-mix(in srgb, var(--text) 8%, transparent)",
                }}
              >
                <Icon name={row.icon} size={18} className={isFx ? "text-[#22a7f0]" : "text-dk-red"} />
              </span>
              <span className="text-sm font-bold truncate">
                {row.name}
                {isFx && (
                  <span
                    className="inline-block mr-2 text-[10px] font-black px-2 py-0.5 rounded-full text-white align-middle"
                    style={{ background: "#22a7f0" }}
                  >
                    ارز
                  </span>
                )}
              </span>
            </div>

            <div className="text-left shrink-0">
              {row.price !== null ? (
                <>
                  <p className="text-sm md:text-base font-black digits">
                    {formatPrice(row.price)}
                    <span className="text-[10px] font-medium mr-1" style={{ color: "var(--text-secondary)" }}>
                      تومان
                    </span>
                  </p>
                  <p
                    className={`text-[11px] font-bold flex items-center justify-end gap-1 ${
                      row.change >= 0 ? "text-dk-green" : "text-dk-red"
                    }`}
                  >
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      {row.change >= 0 ? <path d="M7 14l5-5 5 5" /> : <path d="M7 10l5 5 5-5" />}
                    </svg>
                    {row.change === 0
                      ? "بدون تغییر"
                      : `${Math.abs(row.changePercent).toLocaleString("fa-IR", { maximumFractionDigits: 2 })}٪`}
                  </p>
                </>
              ) : (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>در دسترس نیست</span>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* لینک‌ها */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Link
          href="/category/gold-silver"
          className="inline-flex items-center gap-2 bg-dk-red text-white text-sm font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          مشاهده محصولات طلا و سکه
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full border"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          بازگشت به خانه
        </Link>
      </div>

    </div>
  );
}

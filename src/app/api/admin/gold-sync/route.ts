import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { forceGoldSync } from "@/lib/gold-prices";

export async function POST(request: Request) {
  const result = await requireAdmin(request);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const { prices, synced } = await forceGoldSync();
    return NextResponse.json({
      synced,
      updatedAt: prices.date,
      gold18k: prices.gold18k,
      sekkeh: prices.sekkeh,
      rob: prices.rob,
      nim: prices.nim,
      usd: prices.usd,
    });
  } catch (err) {
    console.error("[admin/gold-sync]", err);
    return NextResponse.json(
      { error: "خطا در همگام‌سازی قیمت طلا — دوباره تلاش کنید" },
      { status: 500 },
    );
  }
}

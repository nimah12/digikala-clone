import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getGoldPrices } from "@/lib/gold-prices";

export async function GET(request: Request) {
  const result = await requireAdmin(request);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    // getGoldPrices کش را می‌خواند و در صورت نبود تاریخچه، بک‌فیل می‌کند
    const prices = await getGoldPrices();
    const points = [...(prices.history ?? [])].sort((a, b) => a.t - b.t);
    return NextResponse.json({
      points,
      count: points.length,
      updatedAt: prices.date,
      fetchedAt: prices.fetchedAt,
    });
  } catch (err) {
    console.error("[admin/gold-history]", err);
    return NextResponse.json(
      { error: "خطا در خواندن تاریخچه قیمت طلا" },
      { status: 500 },
    );
  }
}

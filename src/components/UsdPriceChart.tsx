"use client";

import PriceSeriesChart, { type SeriesConfig } from "@/components/PriceSeriesChart";
import type { GoldHistoryPoint } from "@/lib/gold-prices";

// نمودار جداگانه و دقیق دلار آمریکا — با مقیاس خودش (هزار تومان)
export const USD_SERIES: SeriesConfig = {
  key: "usd",
  label: "دلار آمریکا",
  color: "#22a7f0",
  scale: 1_000,
  unitLabel: "هزار تومان",
  csvName: "usd-price",
};

export default function UsdPriceChart({
  history,
}: {
  history: GoldHistoryPoint[];
}) {
  return <PriceSeriesChart history={history} series={USD_SERIES} />;
}

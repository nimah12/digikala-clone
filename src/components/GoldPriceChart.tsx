"use client";

import PriceSeriesChart, { type SeriesConfig } from "@/components/PriceSeriesChart";
import type { GoldHistoryPoint } from "@/lib/gold-prices";

// نمودار قیمت طلا — فقط طلای ۱۸ عیار (سکه و دلار در نمودارهای جدا هستند)
export const GOLD_SERIES: SeriesConfig = {
  key: "gold18k",
  label: "طلای ۱۸ عیار (گرم)",
  color: "#f9a825",
  scale: 1_000_000,
  unitLabel: "میلیون تومان",
  csvName: "gold-price",
};

export default function GoldPriceChart({
  history,
}: {
  history: GoldHistoryPoint[];
}) {
  return <PriceSeriesChart history={history} series={GOLD_SERIES} />;
}

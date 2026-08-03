import { formatRating } from "@/lib/format";

export default function Rating({ rating, ratingCount }: { rating: number; ratingCount: number }) {
  return (
    <div className="flex items-center gap-1">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f9a825" aria-hidden="true">
        <path d="M12 2l2.9 6.26 6.85.83-5.06 4.68 1.33 6.77L12 17.2 5.98 20.54l1.33-6.77L2.25 9.09l6.85-.83L12 2z" />
      </svg>
      <span className="text-xs font-bold digits">{formatRating(rating)}</span>
      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        ({ratingCount.toLocaleString("fa-IR")})
      </span>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/format";
import ReviewForm from "./ReviewForm";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${formatRating(rating)} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#f9a825" : "none"}
          stroke="#f9a825"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.26 6.85.83-5.06 4.68 1.33 6.77L12 17.2 5.98 20.54l1.33-6.77L2.25 9.09l6.85-.83L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// توزیع واقعی امتیازها از روی دیدگاه‌های ثبت‌شده (برای نوار ستاره‌ها)
function ratingBreakdown(reviews: { rating: number }[]): { star: number; pct: number }[] {
  if (reviews.length === 0) {
    return [5, 4, 3, 2, 1].map((star) => ({ star, pct: 0 }));
  }
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: Math.round(
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
    ),
  }));
}

export default async function Reviews({ productId, rating, ratingCount }: { productId: number; rating: number; ratingCount: number }) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { id: "asc" },
  });

  const breakdown = ratingBreakdown(reviews);

  return (
    <section
      className="mt-8 rounded-2xl border p-4 md:p-6"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      <h2 className="text-lg font-extrabold mb-5">
        دیدگاه کاربران{" "}
        <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
          ({reviews.length.toLocaleString("fa-IR")} دیدگاه)
        </span>
      </h2>

      {/* Rating summary */}
      <div className="flex items-center gap-6 mb-6 p-4 rounded-xl" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="text-4xl font-extrabold digits">{formatRating(rating)}</div>
          <div className="flex items-center justify-center mt-1">
            <Stars rating={rating} />
          </div>
          <div className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
            {ratingCount.toLocaleString("fa-IR")} امتیاز
          </div>
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          {breakdown.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-2 text-[11px]">
              <span className="shrink-0" style={{ color: "var(--text-secondary)" }}>
                {star.toLocaleString("fa-IR")} ستاره
              </span>
              <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${pct}%`, background: "#f9a825" }}
                />
              </div>
              <span className="w-8 text-left digits" style={{ color: "var(--text-muted)" }}>
                ٪{pct}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "var(--text-secondary)" }}>
          هنوز دیدگاهی ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "var(--bg)", color: "var(--text-secondary)" }}
                  >
                    {review.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{review.author}</div>
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {review.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.verified && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#2ab57d", color: "#fff" }}
                    >
                      خرید تأیید شده
                    </span>
                  )}
                  <Stars rating={review.rating} />
                </div>
              </div>
              <h3 className="text-sm font-bold mb-1">{review.title}</h3>
              <p className="text-xs leading-6" style={{ color: "var(--text-secondary)" }}>
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* فرم ثبت دیدگاه از صفحه محصول */}
      <ReviewForm productId={productId} />
    </section>
  );
}

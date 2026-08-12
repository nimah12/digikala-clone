export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--bg)" }}
    >
      {/* Brand logo */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 h-12 px-5 rounded-full text-white font-extrabold bg-gradient-to-l from-dk-red to-[#f77f48] shadow-md">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="text-lg">دیجی‌کلون</span>
        </span>
      </div>

      {/* Digikala-style spinner */}
      <div className="relative w-14 h-14" role="status" aria-label="در حال بارگذاری">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "3px solid var(--border)", borderTopColor: "#ef4050", borderRightColor: "#ef4050" }}
        />
        <div
          className="loading-spinner absolute inset-0 rounded-full"
          style={{ border: "3px solid transparent", borderTopColor: "#ef4050" }}
        />
      </div>

      <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        در حال بارگذاری…
      </div>
    </div>
  );
}

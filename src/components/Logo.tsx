import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-lg",
    lg: "h-12 px-5 text-xl",
  };

  return (
    <Link href="/" className="shrink-0 group" aria-label="دیجی‌کلون">
      <span
        className={`inline-flex items-center gap-2 ${sizes[size]} rounded-full text-white font-extrabold bg-gradient-to-l from-dk-red to-[#f77f48] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200`}
      >
        {/* shopping-bag icon like digikala */}
        <svg width={size === "lg" ? 22 : size === "md" ? 18 : 15} height={size === "lg" ? 22 : size === "md" ? 18 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span>دیجی‌کلون</span>
      </span>
    </Link>
  );
}

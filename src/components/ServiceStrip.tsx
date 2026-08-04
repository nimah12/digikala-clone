const SERVICES = [
  { icon: "🚚", label: "تحویل اکسپرس" },
  { icon: "💵", label: "پرداخت در محل" },
  { icon: "✅", label: "ضمانت اصالت کالا" },
  { icon: "↩️", label: "۷ روز ضمانت بازگشت" },
  { icon: "📦", label: "ارسال رایگان" },
];

export default function ServiceStrip() {
  return (
    <div
      className="rounded-2xl border p-3 mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      {SERVICES.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-dk-bg transition-colors cursor-pointer"
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

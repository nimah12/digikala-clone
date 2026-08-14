import Icon from "./Icon";

const SERVICES = [
  { icon: "truck", label: "تحویل اکسپرس" },
  { icon: "banknote", label: "پرداخت در محل" },
  { icon: "shield", label: "ضمانت اصالت کالا" },
  { icon: "return", label: "۷ روز ضمانت بازگشت" },
  { icon: "box", label: "ارسال رایگان(استان تهران)" },
] as const;

export default function ServiceStrip() {
  return (
    <div
      className="rounded-2xl border p-3 mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      {SERVICES.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-[var(--hover)] transition-colors cursor-pointer"
        >
          <span
            className="text-dk-red"
            style={{ color: "var(--dk-red, #ef4050)" }}
          >
            <Icon name={item.icon} size={22} />
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

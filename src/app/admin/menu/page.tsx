"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MenuSub = { name: string; slug: string; href: string; source: string };
type MenuCat = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcategories: MenuSub[];
};
type MenuGroup = { id: number; title: string; icon: string; categories: MenuCat[] };

export default function AdminMenuPreviewPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState(0);
  const [error, setError] = useState("");

  function authHeaders(): HeadersInit {
    const token = localStorage.getItem("dk-token") || "";
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    const token = localStorage.getItem("dk-token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("denied");
      return;
    }
    fetch("/api/admin/me", { headers: authHeaders() }).then(async (res) => {
      if (!res.ok) {
        setStatus("denied");
        return;
      }
      try {
        const r = await fetch("/api/admin/menu", { headers: authHeaders() });
        if (!r.ok) throw new Error();
        const data = await r.json();
        setGroups(data.menu || []);
        setStatus("ready");
      } catch {
        setError("خطا در دریافت پیش‌نمایش مگامنو");
        setStatus("ready");
      }
    });
  }, []);

  if (status === "loading") {
    return <p className="text-sm py-16 text-center">در حال بارگذاری...</p>;
  }

  if (status === "denied") {
    return (
      <div className="py-16 text-center">
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          برای ورود به پنل مدیریت باید با حساب ادمین وارد شوید.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red rounded-xl px-5 py-2.5 transition-colors">
          ورود به حساب
        </Link>
      </div>
    );
  }

  const active = groups[activeGroup];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-extrabold">پیش‌نمایش مگامنو</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          این دقیقاً همان منوی دسته‌بندی است که در هدر فروشگاه نمایش داده می‌شود.
          تغییرات «گروه‌های منو» و «دسته‌بندی‌ها» بلافاصله اینجا اعمال می‌شود.
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center text-sm" style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          هنوز گروهی تعریف نشده است. از صفحه‌ی «گروه‌های منو» شروع کنید.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="border-b px-4 py-2.5 text-xs font-bold" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            <span className="inline-block w-2.5 h-2.5 rounded-full align-middle ml-1.5" style={{ background: "#16a34a" }} />
            سینک زنده با پنل ادمین — ساختار فعلی
          </div>

          <div className="flex flex-col md:flex-row md:max-h-[560px]">
            {/* Group rail */}
            <div className="w-full md:w-48 md:shrink-0 py-2 md:overflow-y-auto border-b md:border-b-0 md:border-l" style={{ background: "color-mix(in srgb, var(--bg) 55%, transparent)", borderColor: "var(--border)" }}>
              {groups.map((g, i) => {
                const isActive = i === activeGroup;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGroup(i)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                      isActive ? "text-dk-red font-bold" : "hover:bg-[var(--hover)]"
                    }`}
                    style={
                      isActive
                        ? { background: "color-mix(in srgb, #ef4050 7%, transparent)" }
                        : { color: "var(--text-secondary)" }
                    }
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-dk-red shrink-0">{g.icon}</span>
                      {g.title}
                    </span>
                    <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                      {g.categories.length.toLocaleString("fa-IR")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Category panel */}
            <div className="flex-1 p-4 md:p-6 md:overflow-y-auto min-h-0">
              {active && (
                <>
                  <h3 className="text-base font-extrabold mb-4">
                    <span className="text-dk-red ml-1">{active.icon}</span>
                    {active.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {active.categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          href={`/category/${cat.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-sm font-bold hover:text-dk-red transition-colors mb-2"
                        >
                          <span className="text-dk-red">{cat.icon}</span>
                          {cat.name}
                          <span className="text-[10px] font-normal" style={{ color: "var(--text-muted)" }} dir="ltr">
                            /{cat.slug}
                          </span>
                        </Link>
                        {cat.subcategories.length > 0 ? (
                          <ul className="space-y-1.5">
                            {cat.subcategories.slice(0, 6).map((sub) => (
                              <li key={`${sub.slug}-${sub.name}`} className="flex items-center justify-between gap-2">
                                <Link
                                  href={sub.href}
                                  target="_blank"
                                  className="text-xs hover:text-dk-red transition-colors"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {sub.name}
                                </Link>
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded"
                                  title={sub.source === "admin" ? "دسته‌ی فرزند (مدیریت‌شده در پنل ادمین)" : "ساب‌دسته‌ی دیتابیس (دارای تصویر)"}
                                  style={{
                                    background:
                                      sub.source === "admin"
                                        ? "color-mix(in srgb, #ef4050 12%, transparent)"
                                        : "color-mix(in srgb, #2563eb 10%, transparent)",
                                    color: sub.source === "admin" ? "#ef4050" : "#2563eb",
                                  }}
                                >
                                  {sub.source === "admin" ? "ادمین" : "DB"}
                                </span>
                              </li>
                            ))}
                            {cat.subcategories.length > 6 && (
                              <li className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                + {cat.subcategories.length - 6} مورد دیگر
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            ساب‌دسته‌ای ندارد.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs" style={{ color: "var(--text-secondary)" }}>
        راهنما: برچسب‌های قرمز «ادمین» یعنی آن ساب‌دسته را شما در پنل ساختید؛ برچسب آبی
        «DB» یعنی از دیتابیس/سید آمده است. برای دیدن لینک هر بخش روی آن کلیک کنید.
      </div>
    </div>
  );
}

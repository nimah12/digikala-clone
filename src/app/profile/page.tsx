"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, setCurrentUser, type CurrentUser } from "@/lib/user";

const PERSONAL = [
  { key: "profile", label: "پروفایل", icon: "👤" },
  { key: "change-password", label: "تغییر رمز", icon: "🔑" },
  { key: "newsletter", label: "خبرنامه", icon: "✉️" },
];

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("profile");

  // password tab
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSaved, setPassSaved] = useState(false);

  // newsletter
  const [newsletter, setNewsletter] = useState(false);

  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
    }
    try {
      setAddress(localStorage.getItem("dk-address") || "");
      setNewsletter(localStorage.getItem("dk-newsletter") === "1");
    } catch {}
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && !user) router.push("/login");
  }, [checked, user, router]);

  if (!checked || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCurrentUser({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
    setUser({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
    try { localStorage.setItem("dk-address", address); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    setPassSaved(false);
    // در دمو، رمز قبلی 123456 است (یا همانی که ثبت شده)
    if (oldPass.length < 6) {
      setPassError("رمز قبلی را وارد کنید.");
      return;
    }
    if (newPass.length < 6) {
      setPassError("رمز جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (!/[A-Z]/.test(newPass)) {
      setPassError("رمز جدید باید حداقل یک حرف بزرگ (A-Z) داشته باشد.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPass)) {
      setPassError("رمز جدید باید حداقل یک کاراکتر خاص (مثل @ یا !) داشته باشد.");
      return;
    }
    // ذخیره رمز جدید در localStorage (نسخه دمو)
    try { localStorage.setItem("dk-password", newPass); } catch {}
    setOldPass("");
    setNewPass("");
    setPassSaved(true);
  }

  function handleNewsletter() {
    const next = !newsletter;
    setNewsletter(next);
    try { localStorage.setItem("dk-newsletter", next ? "1" : "0"); } catch {}
  }

  const userName = user.name;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        <Link href="/dashboard" className="hover:text-dk-red">پنل کاربری</Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>پروفایل</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white" style={{ background: "#ef4050" }}>
          {userName?.[0] || "ک"}
        </span>
        <div>
          <h1 className="text-xl font-extrabold">{userName}</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {user.email || user.phone || ""}
          </p>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <div className="rounded-2xl border p-2 h-fit" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          {PERSONAL.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === item.key ? "text-dk-red bg-dk-red/10" : ""
              }`}
              style={tab === item.key ? { color: "#ef4050", background: "rgba(239,64,80,0.08)" } : { color: "var(--text)", background: "transparent" }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link
            href="/orders"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-dk-bg"
            style={{ color: "var(--text)" }}
          >
            <span className="text-lg">📦</span>
            سفارش‌های من
          </Link>
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-dk-bg"
            style={{ color: "var(--text)" }}
          >
            <span className="text-lg">🏠</span>
            داشبورد
          </Link>
        </div>

        {/* Content */}
        <div>
          {tab === "profile" && (
            <div className="rounded-2xl border p-6" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
              <h2 className="font-bold mb-5">اطلاعات شخصی</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">نام و نام خانوادگی</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">ایمیل</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr"
                    className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">شماره موبایل</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">آدرس</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="نشانی پستی"
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
                {saved && (
                  <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(42,181,125,0.1)", color: "#2ab57d" }}>
                    ✓ اطلاعات با موفقیت ذخیره شد
                  </div>
                )}
                <button type="submit" className="h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors">
                  ذخیره اطلاعات
                </button>
              </form>
            </div>
          )}

          {tab === "change-password" && (
            <div className="rounded-2xl border p-6" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
              <h2 className="font-bold mb-5">تغییر رمز عبور</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">رمز فعلی</label>
                  <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">رمز جدید</label>
                  <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="حداقل ۶ کاراکتر با @ و حرف بزرگ"
                    className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }} />
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                    حداقل ۶ کاراکتر، شامل حرف بزرگ و کاراکتر خاص
                  </p>
                </div>
                {passError && (
                  <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}>
                    ⚠️ {passError}
                  </div>
                )}
                {passSaved && (
                  <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(42,181,125,0.1)", color: "#2ab57d" }}>
                    ✓ رمز عبور با موفقیت تغییر کرد
                  </div>
                )}
                <button type="submit" className="h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors">
                  تغییر رمز
                </button>
              </form>
            </div>
          )}

          {tab === "newsletter" && (
            <div className="rounded-2xl border p-6" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
              <h2 className="font-bold mb-5">خبرنامه</h2>
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--bg)" }}>
                <div>
                  <div className="text-sm font-bold">ارسال خبرنامه</div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    خبرهای تخفیف و محصولات جدید را دریافت کنید
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNewsletter}
                  className={`w-12 h-7 rounded-full relative transition-colors ${newsletter ? "bg-dk-green" : ""}`}
                  style={{ background: newsletter ? "#2ab57d" : "var(--border)" }}
                  aria-label="فعال‌سازی خبرنامه"
                >
                  <span
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all"
                    style={{ left: newsletter ? "22px" : "2px" }}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
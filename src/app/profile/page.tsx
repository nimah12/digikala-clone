"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, setCurrentUser, type CurrentUser } from "@/lib/user";

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      setName(u.name || "");
      setEmail(u.email || "");
    }
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

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCurrentUser({ ...user, name: name.trim(), email: email.trim() || undefined });
    setUser({ ...user, name: name.trim(), email: email.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        <Link href="/dashboard" className="hover:text-dk-red">پنل کاربری</Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>پروفایل</span>
      </nav>

      <div className="rounded-2xl border p-6" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4 mb-6">
          <span
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl text-white"
            style={{ background: "#ef4050" }}
          >
            {user.name?.[0] || "ک"}
          </span>
          <div>
            <h1 className="text-lg font-extrabold">پروفایل من</h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              ویرایش اطلاعات حساب کاربری
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">نام و نام خانوادگی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50 text-left"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          {saved && (
            <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(42,181,125,0.1)", color: "#2ab57d" }}>
              ✓ اطلاعات با موفقیت ذخیره شد
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
            >
              ذخیره تغییرات
            </button>
            <Link
              href="/dashboard"
              className="h-11 px-5 rounded-lg border text-sm font-bold transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              بازگشت
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

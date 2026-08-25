"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type UserRow = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
};

function maskName(_name: string): string {
  return "***";
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 11 && digits.startsWith("09")) {
    return `${digits.slice(0, 3)}*** ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return "09*** ****";
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length > 2 ? `${local.slice(0, 2)}***` : "***";
  return `${masked}@${domain}`;
}

export default function AdminUsersPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [meId, setMeId] = useState<number | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  function authHeaders(): HeadersInit {
    const token = localStorage.getItem("dk-token") || "";
    return { Authorization: `Bearer ${token}` };
  }

  const loadUsers = useCallback(async (query: string) => {
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: authHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت کاربران");
      setStatus("ready");
    }
  }, []);

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
      const me = await res.json();
      setMeId(me.user?.id ?? null);
      setIsDemo(me.user?.role === "demo");
      await loadUsers("");
    });
  }, [loadUsers]);

  async function handleRoleChange(userId: number, role: string) {
    setError("");
    setSavingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تغییر نقش ناموفق بود");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setSavingId(null);
    }
  }

  if (status === "loading") {
    return <p className="text-sm py-16 text-center">در حال بارگذاری...</p>;
  }

  if (status === "denied") {
    return (
      <div className="py-16 text-center">
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          برای ورود به پنل مدیریت باید با حساب ادمین وارد شوید.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red rounded-xl px-5 py-2.5 transition-colors"
        >
          ورود به حساب
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 13,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-extrabold">کاربران</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            مدیریت کاربران و نقش‌ها — می‌توانید کاربری را ادمین کنید
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          dir="ltr"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadUsers(q);
          }}
          placeholder="جستجو با نام، ایمیل یا شماره موبایل..."
          style={{ ...inputStyle, width: 260 }}
        />
        <button
          type="button"
          onClick={() => loadUsers(q)}
          className="text-sm font-bold rounded-xl px-4 py-2 border transition-colors hover:border-dk-red hover:text-dk-red"
          style={{ borderColor: "var(--border)" }}
        >
          جستجو
        </button>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center text-sm" style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          کاربری پیدا نشد.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <th className="text-right px-4 py-2 font-bold">نام</th>
                  <th className="text-right px-4 py-2 font-bold">ایمیل / تلفن</th>
                  <th className="text-right px-4 py-2 font-bold">تاریخ عضویت</th>
                  <th className="text-right px-4 py-2 font-bold">سفارش‌ها</th>
                  <th className="text-right px-4 py-2 font-bold">نقش</th>
                  <th className="text-left px-4 py-2 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const displayEmail = isDemo ? maskEmail(u.email) : u.email;
                  const displayPhone = u.phone ? (isDemo ? maskPhone(u.phone) : u.phone) : null;
                  const displayName = isDemo ? maskName(u.name ?? "") : u.name;
                  return (
                    <tr key={u.id} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3">
                        <div className="font-bold">
                          {displayName || "—"}
                          {u.id === meId && (
                            <span className="text-[10px] font-bold text-white bg-dk-red rounded-md px-1.5 py-0.5 ml-1">شما</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <div dir="ltr">{displayEmail}</div>
                        {displayPhone && <div dir="ltr" className="text-[11px]">{displayPhone}</div>}
                      </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {new Date(u.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-4 py-3">{u._count.orders.toLocaleString("fa-IR")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          u.role === "admin" ? "bg-dk-red text-white" : ""
                        }`}
                        style={u.role !== "admin" ? { background: "color-mix(in srgb, var(--bg) 70%, transparent)", color: "var(--text-secondary)", border: "1px solid var(--border)" } : undefined}
                      >
                        {u.role === "admin" ? "ادمین" : "کاربر"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {u.role === "admin" ? (
                          <button
                            type="button"
                            onClick={() => handleRoleChange(u.id, "user")}
                            disabled={savingId === u.id || u.id === meId}
                            className="text-[11px] font-bold rounded-lg px-2.5 py-1 text-dk-red border border-dk-red/40 hover:bg-dk-red/10 transition-colors disabled:opacity-50"
                            title={u.id === meId ? "نمی‌توانید نقش خودتان را تغییر دهید" : undefined}
                          >
                            {savingId === u.id ? "..." : "حذف ادمین"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRoleChange(u.id, "admin")}
                            disabled={savingId === u.id}
                            className="text-[11px] font-bold rounded-lg px-2.5 py-1 border transition-colors hover:border-dk-red hover:text-dk-red disabled:opacity-50"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {savingId === u.id ? "..." : "ادمین کردن"}
                          </button>
                        )}
                      </div>
</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

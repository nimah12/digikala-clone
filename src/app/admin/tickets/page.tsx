"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Ticket = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  createdAt: string;
  userId: number | null;
};

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length > 2 ? `${local.slice(0, 2)}***` : "***";
  return `${masked}@${domain}`;
}

function maskName(_name: string): string {
  return "***";
}

function maskSubject(_subject: string): string {
  return "***";
}

const STATUS_LABELS: Record<string, string> = {
  open: "باز",
  answered: "پاسخ داده شده",
  closed: "بسته شده",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#ef4050",
  answered: "#16a34a",
  closed: "#a1a3a8",
};

export default function AdminTicketsPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  function authHeaders(): HeadersInit {
    return { Authorization: `Bearer ${localStorage.getItem("dk-token") ?? ""}` };
  }

  const loadTickets = useCallback(async (statusFilter: string) => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/tickets?${params}`, {
        headers: authHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const data = await res.json();
      setTickets(data.tickets || []);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت تیکت‌ها");
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
      setIsDemo(me.user?.role === "demo");
      loadTickets("all");
    });
  }, [loadTickets]);

  async function updateTicket(ticketId: number, patch: { status?: string; reply?: string }) {
    setSavingId(ticketId);
    setError("");
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در به‌روزرسانی تیکت");
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
      setReplyDrafts((d) => ({ ...d, [ticketId]: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setSavingId(null);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <h1 className="text-lg font-extrabold">تیکت‌های پشتیبانی</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            تیکت‌های کاربران — با هر تیکت جدید به ادمین ایمیل ارسال می‌شود
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "open", "answered", "closed"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setFilter(s);
                loadTickets(s);
              }}
              className={`text-xs font-bold rounded-xl px-3 py-2 border transition-colors ${
                filter === s ? "bg-dk-red text-white border-dk-red" : "hover:border-dk-red hover:text-dk-red"
              }`}
              style={{ borderColor: "var(--border)", color: filter === s ? undefined : "var(--text-secondary)" }}
            >
              {s === "all" ? "همه" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div
          className="rounded-2xl border p-16 text-center text-sm"
          style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          تیکتی پیدا نشد.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <th className="text-right px-4 py-2 font-bold">شماره</th>
                  <th className="text-right px-4 py-2 font-bold">تاریخ</th>
                  <th className="text-right px-4 py-2 font-bold">فرستنده</th>
                  <th className="text-right px-4 py-2 font-bold">موضوع</th>
                  <th className="text-right px-4 py-2 font-bold">وضعیت</th>
                  <th className="text-left px-4 py-2 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const displayName = isDemo ? maskName(t.name) : t.name;
                  const displayEmail = isDemo ? maskEmail(t.email) : t.email;
                  const displaySubject = isDemo ? maskSubject(t.subject) : t.subject;
                  return (
                    <Fragment key={t.id}>
                    <tr className="border-b last:border-b-0 align-top" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                          className="font-extrabold hover:text-dk-red transition-colors"
                        >
                          #{t.id.toLocaleString("fa-IR")}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold">{displayName}</div>
                        <div className="text-[11px] digits" dir="ltr" style={{ color: "var(--text-muted)" }}>
                          {displayEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold max-w-[220px] truncate">{displaySubject}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                          style={{ background: STATUS_COLORS[t.status] ?? "#a1a3a8" }}
                        >
                          {STATUS_LABELS[t.status] ?? t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <select
                          value={t.status}
                          disabled={savingId === t.id}
                          onChange={(e) => updateTicket(t.id, { status: e.target.value })}
                          style={inputStyle}
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {expandedId === t.id && (
                      <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                        <td colSpan={6} className="px-4 py-4">
                          <div className="rounded-xl border p-4" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                            <div className="text-xs font-bold mb-1.5">متن تیکت</div>
                            <p className="text-sm leading-7 mb-4" style={{ color: "var(--text)" }}>
                              {t.message}
                            </p>
                            {t.reply && (
                              <div className="mb-4">
                                <div className="text-xs font-bold mb-1.5 text-dk-green">پاسخ قبلی</div>
                                <p className="text-sm leading-7 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                                  {t.reply}
                                </p>
                              </div>
                            )}
                            <div className="text-xs font-bold mb-1.5">پاسخ جدید</div>
                            <textarea
                              rows={3}
                              value={replyDrafts[t.id] ?? ""}
                              onChange={(e) => setReplyDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                              placeholder="پاسخ تیم پشتیبانی..."
                              style={{ ...inputStyle, width: "100%", resize: "vertical" }}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                disabled={savingId === t.id || !(replyDrafts[t.id] ?? "").trim()}
                                onClick={() => updateTicket(t.id, { reply: (replyDrafts[t.id] ?? "").trim(), status: t.status === "open" ? "answered" : t.status })}
                                className="text-xs font-bold text-white bg-dk-green rounded-xl px-4 py-2 transition-opacity disabled:opacity-50"
                              >
                                {savingId === t.id ? "در حال ذخیره..." : "ثبت پاسخ"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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

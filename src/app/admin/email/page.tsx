"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type EmailStatus = {
  apiKeySet: boolean;
  keyType: string | null;
  fromEmail: string | null;
  fromDomain: string | null;
  adminEmail: string | null;
  domains: { name: string; status: string }[];
  domainError: string | null;
};

const DOMAIN_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  verified: { label: "تأیید شده ✓", color: "#16a34a" },
  pending: { label: "در انتظار تأیید", color: "#f59e0b" },
  failed: { label: "ناموفق", color: "#dc2626" },
  not_started: { label: "شروع نشده", color: "#a1a3a8" },
};

export default function AdminEmailPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [data, setData] = useState<EmailStatus | null>(null);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  function authHeaders(): HeadersInit {
    return { Authorization: `Bearer ${localStorage.getItem("dk-token") ?? ""}` };
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/email-status", { headers: authHeaders() });
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const json = await res.json();
      setData(json);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت وضعیت ایمیل");
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
    load();
  }, [load]);

  async function sendTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) {
        setTestResult({ ok: false, message: json.error || "خطا در ارسال" });
      } else {
        setTestResult({ ok: true, message: `ایمیل تست به ${json.to} ارسال شد ✅` });
      }
    } catch {
      setTestResult({ ok: false, message: "خطا در اتصال به سرور" });
    } finally {
      setTesting(false);
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
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red rounded-xl px-5 py-2.5 transition-colors">
          ورود به حساب
        </Link>
      </div>
    );
  }

  const row = (label: string, value: string, ok: boolean) => (
    <div className="flex items-center justify-between gap-3 py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="flex items-center gap-2 text-xs font-bold digits" style={{ color: ok ? "#16a34a" : "#dc2626" }}>
        <span className={`w-2 h-2 rounded-full ${ok ? "bg-[#16a34a]" : "bg-[#dc2626]"}`} />
        {value}
      </span>
    </div>
  );

  const card = (title: string, children: React.ReactNode) => (
    <div className="rounded-2xl border p-5" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
      <h2 className="font-extrabold mb-1">{title}</h2>
      {children}
    </div>
  );

  const verifiedDomain = data?.domains.find((d) => d.status === "verified") ?? null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-lg font-extrabold mb-1">تنظیمات ایمیل</h1>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          وضعیت سرویس Resend، دامنه فرستنده و ارسال ایمیل آزمایشی
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">{error}</div>
      )}

      <div className="space-y-4">
        {card("وضعیت متغیرهای محیطی", (
          <div>
            {row("RESEND_API_KEY", data?.apiKeySet ? "تنظیم شده ✓" : "تنظیم نشده ✗", !!data?.apiKeySet)}
            {row("RESEND_FROM_EMAIL (فرستنده)", data?.fromEmail ?? "استفاده از پیش‌فرض onboarding@resend.dev", !!data?.fromEmail)}
            {row("ADMIN_EMAIL (گیرنده اعلان‌ها)", data?.adminEmail ?? "پیش‌فرض: اولین ادمین دیتابیس", !!data?.adminEmail)}
          </div>
        ))}

        {card("دامنه فرستنده در Resend", (
          <div>
            {data?.domainError ? (
              <div className="mt-2">
                <p className={`text-xs font-bold ${data.keyType === "restricted" ? "text-dk-green" : "text-dk-red"}`}>
                  {data.domainError}
                </p>
                {data.keyType === "restricted" && (
                  <p className="text-[11px] mt-1.5 leading-5" style={{ color: "var(--text-muted)" }}>
                    برای مشاهده وضعیت دامنه، یک کلید <b>Full Access</b> در resend.com/api-keys بسازید — یا همین‌جا با دکمه «ایمیل آزمایشی» ارسال را تست کنید.
                  </p>
                )}
              </div>
            ) : data && data.domains.length === 0 ? (
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                هنوز دامنه‌ای در Resend ثبت نشده است. برای ارسال واقعی ایمیل باید یک دامنه اضافه و تأیید کنید.
                تا آن زمان، ایمیل‌ها با فرستنده پیش‌فرض onboarding@resend.dev ارسال می‌شوند که فقط به ایمیل خودِ صاحب حساب می‌رسد.
              </p>
            ) : (
              <div className="mt-2">
                {data?.domains.map((d) => {
                  const s = DOMAIN_STATUS_LABELS[d.status] ?? { label: d.status, color: "#a1a3a8" };
                  return (
                    <div key={d.name} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                      <span className="text-sm font-bold" dir="ltr">{d.name}</span>
                      <span className="text-[11px] font-black text-white px-2.5 py-1 rounded-full" style={{ background: s.color }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!data?.domainError && !verifiedDomain && data?.keyType !== "restricted" && (
              <p className="text-[11px] mt-3 leading-5" style={{ color: "var(--text-muted)" }}>
                تا تأیید شدن دامنه، ایمیل‌ها با فرستنده پیش‌فرض onboarding@resend.dev ارسال می‌شوند و فقط به ایمیل خودِ صاحب حساب Resend می‌رسند.
              </p>
            )}
          </div>
        ))}

        {card("ایمیل آزمایشی", (
          <div>
            <p className="text-xs leading-6 mb-3" style={{ color: "var(--text-secondary)" }}>
              یک ایمیل تست به آدرس ادمین ارسال می‌کند تا از کارکرد کامل سیستم مطمئن شوید.
            </p>
            <button
              type="button"
              onClick={sendTest}
              disabled={testing || !data?.apiKeySet}
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? "در حال ارسال..." : "ارسال ایمیل آزمایشی"}
            </button>
            {testResult && (
              <p className={`text-xs font-bold mt-3 ${testResult.ok ? "text-dk-green" : "text-dk-red"}`}>
                {testResult.message}
              </p>
            )}
          </div>
        ))}

        {card("راهنمای راه‌اندازی", (
          <ol className="text-xs leading-7 pr-5 list-decimal" style={{ color: "var(--text-secondary)" }}>
            <li>کلید API را از resend.com/api-keys بگیرید و در متغیر <b className="digits" dir="ltr">RESEND_API_KEY</b> بگذارید (محلی: فایل <span className="digits" dir="ltr">.env</span> — ورسل: Project Settings → Environment Variables).</li>
            <li>یک دامنه (مثلاً <span className="digits" dir="ltr">digikloon.ir</span>) در resend.com/domains اضافه و رکوردهای DNS آن را تأیید کنید.</li>
            <li>متغیر <b className="digits" dir="ltr">RESEND_FROM_EMAIL</b> را به شکل <span className="digits" dir="ltr">دیجی‌کلون &lt;noreply@دامنه.ir&gt;</span> تنظیم کنید.</li>
            <li><b className="digits" dir="ltr">ADMIN_EMAIL</b> را برای دریافت اعلان تیکت‌های پشتیبانی تنظیم کنید.</li>
            <li>در ورسل بعد از تغییر متغیرها، یک دیپلوی مجدد بزنید.</li>
          </ol>
        ))}
      </div>
    </div>
  );
}

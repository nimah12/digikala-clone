import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

function maskEmail(email: string | undefined): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.length > 3 ? `${local.slice(0, 2)}***` : "***";
  return `${maskedLocal}@${domain}`;
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_EMAIL;

  let domains: { name: string; status: string; reason?: string }[] = [];
  let domainError: string | null = null;
  let keyType: string | null = null;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: { name: string; status: string; region?: string }[] };
        domains = (json.data ?? []).map((d) => ({
          name: d.name,
          status: d.status,
        }));
      } else {
        const err = (await res.json().catch(() => null)) as { name?: string } | null;
        // کلید‌های «فقط ارسال» (restricted) اجازه لیست دامنه را ندارند ولی ایمیل می‌فرستند
        if (err?.name === "restricted_api_key" || res.status === 401 || res.status === 403) {
          keyType = err?.name === "restricted_api_key" ? "restricted" : "invalid";
          domainError =
            keyType === "restricted"
              ? "کلید از نوع «فقط ارسال» است — لیست دامنه در دسترس نیست، ولی ارسال ایمیل کار می‌کند."
              : "کلید API نامعتبر است";
        } else {
          domainError = `خطای Resend: ${res.status}`;
        }
      }
    } catch {
      domainError = "عدم دسترسی به Resend (اتصال برقرار نشد)";
    }
  }

  return NextResponse.json({
    apiKeySet: !!apiKey,
    keyType,
    fromEmail: fromEmail ? maskEmail(fromEmail) : null,
    fromDomain: fromEmail?.split("@")[1] ?? null,
    adminEmail: adminEmail ? maskEmail(adminEmail) : null,
    domains,
    domainError,
  });
}

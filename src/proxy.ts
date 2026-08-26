import { NextResponse, type NextRequest } from "next/server";

// origin دامنه‌ی عمومی Backblaze B2 (برای CSP)؛ در صورت نبود env مقدار بی‌اثر می‌گذاریم
const B2_ORIGIN = process.env.B2_PUBLIC_URL
  ? new URL(process.env.B2_PUBLIC_URL).origin
  : "";

// Security headers برای همه‌ی صفحات سایت
const SECURITY_HEADERS: Record<string, string> = {
  // جلوگیری از کلیک‌جکینگ (قرار گرفتن سایت داخل iframe سایت‌های دیگر)
  "X-Frame-Options": "DENY",
  // جلوگیری از MIME sniffing مرورگر
  "X-Content-Type-Options": "nosniff",
  // محدود کردن referrer که نشت نکند
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // جلوگیری از تشخیص سایت به‌عنوان مرورگر قدیمی/API قدرتمند
  "X-Permitted-Cross-Domain-Policies": "none",
  // محافظت اولیه از XSS در مرورگرهای قدیمی
  "X-XSS-Protection": "0",
  // سیاست امنیت محتوا
  // دامنه‌ی B2_PUBLIC_URL (custom domain یا f00x.backblazeb2.com) به‌جای دامنه‌ی Vercel Blob
  "Content-Security-Policy": [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${B2_ORIGIN}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${B2_ORIGIN}`,
    "font-src 'self' data:",
    `connect-src 'self' ${B2_ORIGIN}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export function proxy(_request: NextRequest) {
  const response = NextResponse.next();

  // روی API ها هم اعمال می‌شود (برای همه مسیرها)
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }

  // محافظت ساده از DNS rebinding در حالت dev (اختیاری)
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

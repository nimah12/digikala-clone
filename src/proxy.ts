import { NextResponse, type NextRequest } from "next/server";

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
  // مدیای جدید از مسیر same-origin سرو می‌شود (/api/media)؛
  // دامنه‌های ورسل‌بلاب فقط برای سازگاری با رکوردهای قدیمی دیتابیس نگه داشته شده‌اند
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "font-src 'self' data:",
    "connect-src 'self'",
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

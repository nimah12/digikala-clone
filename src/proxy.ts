import { NextRequest, NextResponse } from "next/server";

const MEDIA = "https://digikala-clone-media.nimah12.workers.dev";
const isDev = process.env.NODE_ENV === "development";

// Security headers ثابت برای همه‌ی صفحات سایت
const STATIC_HEADERS: Record<string, string> = {
  // جلوگیری از کلیک‌جکینگ
  "X-Frame-Options": "DENY",
  // جلوگیری از MIME sniffing مرورگر
  "X-Content-Type-Options": "nosniff",
  // محدود کردن referrer
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // جلوگیری از خواندن policy فایل‌های cross-domain (Flash/PDF)
  "X-Permitted-Cross-Domain-Policies": "none",
  // فیلتر XSS قدیمی مرورگرها خطرناک بود و باید خاموش باشد
  "X-XSS-Protection": "0",
  // اجبار HTTPS (بدون preload، تا برگشت‌پذیر بماند)
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  // دسترسی به قابلیت‌های حساس مرورگر را می‌بندد
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  // جداسازی پنجره‌ی سایت از سایت‌های دیگر
  "Cross-Origin-Opener-Policy": "same-origin",
};

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // nonce + strict-dynamic: فقط اسکریپت‌هایی که nonce دارند اجرا می‌شوند
    // (hostهای GTM برای مرورگرهای قدیمی که strict-dynamic را نمی‌شناسند)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    "style-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com",
    `img-src 'self' data: blob: ${MEDIA} https://*.vercel-storage.com https://*.google-analytics.com https://*.googletagmanager.com`,
    `media-src 'self' ${MEDIA}`,
    "font-src 'self' data:",
    `connect-src 'self' ${MEDIA} https://*.backblazeb2.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
    "frame-src 'self' https://www.googletagmanager.com https://*.googletagmanager.com",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  // یک nonce تصادفی جدید برای هر درخواست
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Next.js nonce را از هدر «درخواست» می‌خواند و روی اسکریپت‌های خودش می‌گذارد
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  for (const [name, value] of Object.entries(STATIC_HEADERS)) {
    response.headers.set(name, value);
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

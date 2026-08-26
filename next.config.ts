import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [".monkeycode-ai.live"],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        // فقط برای سازگاری با مدیاهای قدیمی که هنوز URL ورسل‌بلاب دارند در دیتابیس
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // آپلودهای جدید از مسیر same-origin (/api/media) سرو می‌شوند و به remotePattern نیازی ندارند
  },
};

export default nextConfig;

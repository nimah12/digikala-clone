import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [".monkeycode-ai.live"],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        // دامنه‌ی عمومی Backblaze B2 (custom domain یا f00x.backblazeb2.com) از env خونده می‌شود
        protocol: "https",
        hostname: new URL(
          process.env.B2_PUBLIC_URL || "https://placeholder.invalid"
        ).hostname,
      },
    ],
  },
};

export default nextConfig;

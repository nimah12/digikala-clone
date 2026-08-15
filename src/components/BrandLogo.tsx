import type { ReactNode } from "react";

export type BrandLogoName =
  | "apple"
  | "samsung"
  | "xiaomi"
  | "lenovo"
  | "nike"
  | "adidas"
  | "sony"
  | "bosch"
  | "jbl"
  | "asus"
  | "tefal"
  | "panasonic";

const TEXT_FONT = "Arial, Helvetica, sans-serif";

/**
 * لوگوهای واقعی برند — طراحی‌شده برای پس‌زمینه مشکی:
 * لوگوهای مشکی (اپل/نایک/آدیداس/لنوو) به نسخه سفید تبدیل شدن و
 * لوگوهایی که خودشون پس‌زمینه رنگی دارن (سامسونگ/شیائومی/بوش) دست‌نخورده موندن.
 * همه متن‌ها با دقت اندازه‌گیری شدن تا هیچ حرفی از کادر/شکل رنگی بیرون نزنه.
 */
const MARKS: Record<BrandLogoName, ReactNode> = {
  apple: (
    <path
      fill="#ffffff"
      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
    />
  ),
  samsung: (
    <>
      <ellipse cx="12" cy="12" rx="9.7" ry="8.5" fill="#1428A0" />
      <text
        x="12"
        y="13.7"
        textAnchor="middle"
        fontFamily={TEXT_FONT}
        fontWeight="800"
        fontSize="4.4"
        fill="#fff"
        letterSpacing="0.05"
        direction="ltr"
        unicodeBidi="bidi-override"
      >
        SAMSUNG
      </text>
    </>
  ),
  xiaomi: (
    <>
      <rect x="0.6" y="0.6" width="22.8" height="22.8" rx="4.6" fill="#FF6900" />
      <text
        x="12"
        y="16.8"
        textAnchor="middle"
        fontFamily={TEXT_FONT}
        fontWeight="700"
        fontStyle="italic"
        fontSize="9.5"
        fill="#fff"
      >
        mi
      </text>
    </>
  ),
  lenovo: (
    <>
      <rect x="1.6" y="3" width="5.6" height="7.4" rx="1.3" fill="#E2231A" />
      <text
        x="4.4"
        y="9.2"
        textAnchor="middle"
        fontFamily={TEXT_FONT}
        fontWeight="800"
        fontSize="5"
        fill="#fff"
        direction="ltr"
        unicodeBidi="bidi-override"
      >
        L
      </text>
      <text
        x="8.2"
        y="9.4"
        fontFamily={TEXT_FONT}
        fontWeight="700"
        fontSize="6.4"
        fill="#ffffff"
        letterSpacing="0.1"
        direction="ltr"
        unicodeBidi="bidi-override"
      >
        enovo
      </text>
    </>
  ),
  nike: (
    <path
      fill="#ffffff"
      d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z"
    />
  ),
  adidas: (
    <path
      fill="#ffffff"
      d="M7.25 5 L9.85 5 L8.35 19 L5.75 19 Z M11.45 5 L14.05 5 L12.55 19 L9.95 19 Z M15.65 5 L18.25 5 L16.75 19 L14.15 19 Z"
    />
  ),
  sony: (
    <text
      x="12"
      y="14.5"
      textAnchor="middle"
      fontFamily={TEXT_FONT}
      fontWeight="700"
      fontSize="7.2"
      fill="#ffffff"
      letterSpacing="0.6"
      direction="ltr"
      unicodeBidi="bidi-override"
    >
      SONY
    </text>
  ),
  bosch: (
    <>
      <circle cx="12" cy="12" r="9.8" fill="#E2001A" />
      <text
        x="12"
        y="13.5"
        textAnchor="middle"
        fontFamily={TEXT_FONT}
        fontWeight="800"
        fontSize="4.4"
        fill="#fff"
        letterSpacing="0.2"
        direction="ltr"
        unicodeBidi="bidi-override"
      >
        BOSCH
      </text>
    </>
  ),
  jbl: (
    <text
      x="12"
      y="15"
      textAnchor="middle"
      fontFamily={TEXT_FONT}
      fontWeight="800"
      fontSize="8.4"
      fill="#ffffff"
      letterSpacing="0.6"
      direction="ltr"
      unicodeBidi="bidi-override"
    >
      JBL
    </text>
  ),
  asus: (
    <>
      <path
        fill="#00A2E8"
        d="M4 6.6c2.9-1.9 6.3-2.9 9.6-2.6 2.7.2 5.1 1.5 6.7 3.2l-1.7 1.3c-1.4-1.5-3.4-2.5-5.6-2.7-2.8-.2-5.5.7-7.6 2.2L4 6.6z"
      />
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fontFamily={TEXT_FONT}
        fontWeight="800"
        fontSize="7"
        fill="#ffffff"
        letterSpacing="0.1"
        direction="ltr"
        unicodeBidi="bidi-override"
      >
        ASUS
      </text>
    </>
  ),
  tefal: (
    <>
      <rect x="2.2" y="2.2" width="6.4" height="6.4" rx="1.4" fill="#E30613" />
      <text
        x="12"
        y="14.4"
        textAnchor="middle"
        fontFamily={TEXT_FONT}
        fontWeight="800"
        fontSize="6.6"
        fill="#E30613"
        letterSpacing="0"
        direction="ltr"
        unicodeBidi="bidi-override"
      >
        TEFAL
      </text>
    </>
  ),
  panasonic: (
    <text
      x="15"
      y="10"
      textAnchor="middle"
      fontFamily={TEXT_FONT}
      fontWeight="700"
      fontSize="5.6"
      fill="#ffffff"
      letterSpacing="0"
      direction="ltr"
      unicodeBidi="bidi-override"
    >
      Panasonic
    </text>
  ),
};

// لوگوهایی که کلمه بلند دارن (مثل Panasonic / Samsung / Lenovo) viewBox پهن‌تر
// می‌گیرن تا متن کامل داخل کادر جا بشه
const VIEWBOX: Partial<Record<BrandLogoName, string>> = {
  lenovo: "0 0 28 16",
  panasonic: "0 0 30 16",
};

export default function BrandLogo({
  name,
  size = 48,
  className,
}: {
  name: BrandLogoName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEWBOX[name] ?? "0 0 24 24"}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`لوگوی ${name}`}
      style={{ direction: "ltr" }}
    >
      {MARKS[name]}
    </svg>
  );
}

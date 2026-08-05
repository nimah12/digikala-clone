#!/bin/bash
set -e
cd "$(dirname "$0")/.."
gen() {
  local slug="$1" bg="$2" icon="$3" label="$4"
  cat > "public/images/products/${slug}.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${bg}"/>
  <circle cx="300" cy="240" r="130" fill="#ffffff" opacity="0.25"/>
  <g transform="translate(300,240)">
    <text font-size="170" text-anchor="middle" dominant-baseline="central">${icon}</text>
  </g>
  <text x="300" y="470" font-family="Tahoma, Arial, sans-serif" font-size="34" font-weight="bold" fill="#424750" text-anchor="middle">${label}</text>
  <text x="300" y="515" font-family="Tahoma, Arial, sans-serif" font-size="22" fill="#81858B" text-anchor="middle" direction="rtl">فروشگاه دیجی‌کلون</text>
</svg>
SVG
}
# لوازم خانگی
gen coffee-maker "#f5edf9" "☕" "قهوه‌ساز"
gen air-fryer "#fdf3e3" "🍟" "سرخ‌کن"
gen iron "#eef4fa" "👔" "اتو"
gen kettle "#fdf6ec" "🫖" "کتری"
gen microwave "#f0eaf8" "🍲" "مایکروویو"
# کتاب
gen book-novel "#f5f0e8" "📚" "رمان"
gen book-poetry "#fdeef0" "📖" "شعر"
gen book-selfhelp "#e8f4fd" "📗" "روانشناسی"
gen book-child "#f9e8f4" "📘" "کودک"
gen book-tech "#eef2f7" "📕" "کامپیوتر"
# عطر
gen perfume-m "#eef4fa" "🧴" "عطر مردانه"
gen perfume-w "#f9e8f4" "🌸" "عطر زنانه"
gen perfume-unisex "#f0eaf8" "🌿" "عطر یونیسکس"
# اسباب‌بازی
gen lego "#fdeef0" "🧱" "لگو"
gen doll "#f9e8f4" "🎎" "عروسک"
gen puzzle "#eef7ec" "🧩" "پازل"
gen rc-car "#e8f4fd" "🚗" "ماشین کنترلی"
# دکوری
gen vase "#f5f0e8" "🏺" "گلدان"
gen candle "#fdf3e3" "🕯️" "شمع"
gen photo-frame "#eef2f7" "🖼️" "قاب عکس"
gen wall-clock "#f0eaf8" "🕰️" "ساعت دیواری"
echo "More cat images: $(ls public/images/products | wc -l) total"

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
gen airpods-pro "#f2f2f7" "🎧" "ایرپادز پرو"
gen sony-wh1000xm5 "#e8f0fe" "🎧" "سونی WH-1000XM5"
gen jbl-flip6 "#fff3e0" "🎧" "JBL فلیپ 6"
gen tv-samsung-55 "#e3edf7" "📺" "تلویزیون سامسونگ"
gen rice-cooker "#fdf6ec" "🍚" "پلوپز"
gen vacuum "#eef4fa" "🧹" "جاروبرقی"
gen hairdryer "#f9e8f4" "💇" "سشوار"
gen blender "#f2f7ec" "🥤" "مخلوط‌کن"
gen dumbbells "#eef2f7" "🏋️" "دمبل"
gen suitcase "#f0e8f8" "🧳" "چمدان"
gen tent "#e8f4ef" "⛺" "چادر کمپینگ"
gen lipstick "#fdeef0" "💄" "رژ لب"
echo "Generated more images: $(ls public/images/products | wc -l) total"

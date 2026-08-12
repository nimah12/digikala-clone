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
gen sneakers "#eef4fa" "👟" "کفش اسپرت"
gen casual-shoes "#f0eaf8" "🥾" "کفش راحتی"
gen jeans-blue "#e8eef7" "👖" "شلوار جین"
gen chinos "#f5f0e8" "👖" "شلوار کتان"
gen shirt-white "#f2f2f7" "👔" "پیراهن رسمی"
gen shirt-casual "#e8f4fd" "👕" "پیراهن یقه‌دار"
gen hoodie "#fdeef0" "🧥" "هودی"
gen windbreaker "#eef7ec" "🧥" "بادگیر"
gen shorts "#fdf3e3" "🩳" "شلوارک"
gen skirt "#f9e8f4" "👗" "دامن"
echo "Fashion images: $(ls public/images/products | wc -l) total"

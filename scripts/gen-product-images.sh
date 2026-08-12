#!/bin/bash
# Generates placeholder SVG product images for the digikala-clone store
set -e
cd "$(dirname "$0")/.."
mkdir -p public/images/products
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
gen iphone-15 "#f2e6ff" "📱" "آیفون 15"
gen samsung-s24 "#e8f4fd" "📱" "گلکسی S24"
gen samsung-s24-ultra "#d9ecff" "📱" "گلکسی S24 اولترا"
gen xiaomi-14 "#fdf3e3" "📱" "شیائومی 14"
gen pixel-8 "#e6f7e9" "📱" "پیکسل 8"
gen macbook-air-m3 "#e8eef7" "💻" "مک‌بوک ایر M3"
gen macbook-pro-m3 "#dde7f5" "💻" "مک‌بوک پرو M3"
gen thinkpad-x1 "#eef2f7" "💻" "لنوو X1 کاربن"
gen ipad-air "#f5edf9" "📱" "آیپد ایر"
gen galaxy-tab "#e6f1fb" "📱" "گلکسی تب S9"
gen apple-watch "#f2f2f7" "⌚" "اپل واچ سری 9"
gen galaxy-watch "#eef3fa" "⌚" "گلکسی واچ 6"
echo "Generated $(ls public/images/products | wc -l) images"

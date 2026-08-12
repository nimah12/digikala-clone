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
# طلا و نقره
gen gold-coin "#fdf3d9" "🪙" "سکه طلا"
gen gold-bar "#f8ecd0" "🧈" "شمش طلا"
gen gold-ring "#fdf0e0" "💍" "انگشتر طلا"
gen silver-chain "#eef2f7" "📿" "گردنبند نقره"
gen gold-bracelet "#fbeeda" "⌚" "دستبند طلا"
# سوپرمارکت
gen pasta "#fdf3e3" "🍝" "ماکارونی"
gen olive-oil "#eef7ec" "🫒" "روغن زیتون"
gen tea "#f4ecd8" "🍵" "چای"
gen coffee "#efe6d8" "☕" "قهوه"
gen milk "#eef6fb" "🥛" "شیر"
gen chocolate "#f3e6e0" "🍫" "شکلات"
# لباس و مد
gen tshirt "#f0f4fa" "👕" "تی‌شرت"
gen jeans "#e8eef7" "👖" "شلوار جین"
gen shoes "#f2f2f7" "👟" "کفش ورزشی"
gen jacket "#e3e8ef" "🧥" "پالتو"
gen watch-classic "#f0eaf8" "⌚" "ساعت مچی"
# ابزارآلات
gen drill "#fdf3e3" "🛠️" "دریل"
gen screwdriver-set "#eef4fa" "🔧" "ست آچار"
gen ladder "#f5f0e8" "🪜" "نردبان"
gen hammer "#eef1f5" "🔨" "چکش"
gen toolbox "#f0e8e0" "🧰" "جعبه ابزار"
# کارت گرافیک
gen rtx4070 "#e8f4fd" "🎮" "RTX 4070"
gen rx580 "#fdeef0" "🖥️" "RX 580"
gen rtx4060 "#e8f0fe" "🎮" "RTX 4060"
gen rx6700xt "#f2f7ec" "🖥️" "RX 6700 XT"
gen gtx1660 "#eef2f7" "🖥️" "GTX 1660"
echo "New images: $(ls public/images/products | wc -l) total"

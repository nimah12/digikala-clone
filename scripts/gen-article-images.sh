#!/bin/bash
set -e
cd "$(dirname "$0")/.."
gen() {
  local slug="$1" bg="$2" icon="$3" label="$4"
  cat > "public/images/articles/${slug}.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <rect width="800" height="450" fill="${bg}"/>
  <circle cx="400" cy="200" r="140" fill="#ffffff" opacity="0.25"/>
  <g transform="translate(400,190)">
    <text font-size="150" text-anchor="middle" dominant-baseline="central">${icon}</text>
  </g>
  <text x="400" y="380" font-family="Tahoma, Arial, sans-serif" font-size="40" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
</svg>
SVG
}
gen iphone-15 "#3a3a52" "📱" "بررسی آیفون ۱۵"
gen macbook "#2c3e50" "💻" "راهنمای مک‌بوک"
gen airpods "#1f2a44" "🎧" "مقایسه هدفون"
gen watch "#4a2c5e" "⌚" "ساعت هوشمند"
echo "Generated article images: $(ls public/images/articles | wc -l)"

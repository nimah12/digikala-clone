import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const MORE: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number }[] = [
  // لوازم خانگی +10
  { name: 'جارو شارژی دایسون', slug: 'dyson-vacuum', description: 'جاروبرقی شارژی دایسون با مکش قدرتمند', price: 28000000, stock: 4, cat: 'home-appliances', image: '/images/products/vacuum.svg', discount: 8, rating: 4.8, ratingCount: 95, sales: 22 },
  { name: 'ماشین لباسشویی سامسونگ', slug: 'washing-machine', description: 'ماشین لباسشویی 8 کیلوگرمی سامسونگ', price: 32000000, stock: 3, cat: 'home-appliances', image: '/images/products/microwave.svg', discount: 5, rating: 4.6, ratingCount: 65, sales: 18 },
  { name: 'یخچال فریزر بوش', slug: 'bosch-fridge', description: 'یخچال فریزر ساید بای ساید بوش', price: 85000000, stock: 2, cat: 'home-appliances', image: '/images/products/kettle.svg', discount: 3, rating: 4.7, ratingCount: 45, sales: 10 },
  { name: 'مخلوط‌کن سانرف', slug: 'sunbeam-blender', description: 'مخلوط‌کن 800 واتی با پارچ شیشه‌ای', price: 2800000, stock: 15, cat: 'home-appliances', image: '/images/products/blender.svg', discount: 10, rating: 4.4, ratingCount: 85, sales: 32 },
  { name: 'آبمیوه‌گیری پاناسونیک', slug: 'juicer-panasonic', description: 'آبمیوه‌گیری پاناسونیک با موتور 700 وات', price: 5200000, stock: 10, cat: 'home-appliances', image: '/images/products/blender.svg', discount: 6, rating: 4.5, ratingCount: 70, sales: 25 },
  { name: 'ساندویچ‌ساز فیلیپس', slug: 'sandwich-maker', description: 'ساندویچ‌ساز 2 پرس با صفحات نچسب', price: 1800000, stock: 20, cat: 'home-appliances', image: '/images/products/air-fryer.svg', discount: 0, rating: 4.3, ratingCount: 110, sales: 45 },
  { name: 'چرخ گوشت پارس‌خزر', slug: 'meat-grinder', description: 'چرخ گوشت 1800 وات با 3 تیغه استیل', price: 6800000, stock: 8, cat: 'home-appliances', image: '/images/products/toolbox.svg', discount: 5, rating: 4.5, ratingCount: 55, sales: 20 },
  { name: 'سشوار سامسونگ', slug: 'samsung-dryer', description: 'سشوار 2200 وات با 3 حالت حرارتی', price: 2400000, stock: 18, cat: 'home-appliances', image: '/images/products/hairdryer.svg', discount: 7, rating: 4.2, ratingCount: 90, sales: 38 },
  { name: 'اتو پرسی ایستاده', slug: 'steam-press', description: 'اتو پرسی ایستاده با مخزن 1.5 لیتری', price: 4500000, stock: 12, cat: 'home-appliances', image: '/images/products/iron.svg', discount: 0, rating: 4.4, ratingCount: 60, sales: 22 },
  { name: 'گوشت‌کوب برقی', slug: 'electric-tenderizer', description: 'گوشت‌کوب برقی چندکاره برای آشپزخانه', price: 1200000, stock: 22, cat: 'home-appliances', image: '/images/products/rice-cooker.svg', discount: 4, rating: 4.1, ratingCount: 45, sales: 18 },
  // کتاب +10
  { name: 'کیمیاگر', slug: 'book-alchemist', description: 'رمان کیمیاگر اثر پائولو کوئلیو', price: 320000, stock: 40, cat: 'books', image: '/images/products/book-novel.svg', discount: 5, rating: 4.8, ratingCount: 310, sales: 165 },
  { name: 'ملت عشق', slug: 'book-love-nation', description: 'رمان ملت عشق اثر الیف شافاک', price: 450000, stock: 35, cat: 'books', image: '/images/products/book-novel.svg', discount: 8, rating: 4.7, ratingCount: 280, sales: 140 },
  { name: 'شازده کوچولو', slug: 'book-little-prince', description: 'شازده کوچولو اثر آنتوان دو سنت اگزوپری', price: 280000, stock: 50, cat: 'books', image: '/images/products/book-child.svg', discount: 0, rating: 4.9, ratingCount: 400, sales: 220 },
  { name: 'قورباغه را قورت بده', slug: 'book-eat-frog', description: 'کتاب موفقیت برایان تریسی', price: 350000, stock: 45, cat: 'books', image: '/images/products/book-selfhelp.svg', discount: 6, rating: 4.5, ratingCount: 240, sales: 130 },
  { name: 'انسان خردمند', slug: 'book-sapiens', description: 'تاریخ مختصر بشر اثر یووال نوح هراری', price: 580000, stock: 30, cat: 'books', image: '/images/products/book-tech.svg', discount: 10, rating: 4.8, ratingCount: 350, sales: 185 },
  { name: 'بوف کور', slug: 'book-blind-owl', description: 'بوف کور اثر صادق هدایت', price: 260000, stock: 45, cat: 'books', image: '/images/products/book-poetry.svg', discount: 0, rating: 4.6, ratingCount: 300, sales: 160 },
  { name: 'جزء از کل', slug: 'book-part-whole', description: 'جزء از کل اثر استیو تولتز', price: 490000, stock: 25, cat: 'books', image: '/images/products/book-novel.svg', discount: 7, rating: 4.7, ratingCount: 200, sales: 95 },
  { name: 'هنر جنگ', slug: 'book-art-war', description: 'هنر جنگ اثر سان تزو با ترجمه فارسی', price: 220000, stock: 55, cat: 'books', image: '/images/products/book-selfhelp.svg', discount: 0, rating: 4.5, ratingCount: 260, sales: 145 },
  { name: 'کتاب آشپزی ایرانی', slug: 'book-persian-cooking', description: 'کتاب کامل آشپزی ایرانی با 500 دستور', price: 750000, stock: 20, cat: 'books', image: '/images/products/book-tech.svg', discount: 8, rating: 4.6, ratingCount: 180, sales: 85 },
  { name: 'داستان‌های هزار و یک شب', slug: 'book-1001-nights', description: 'مجموعه داستان‌های هزار و یک شب', price: 850000, stock: 15, cat: 'books', image: '/images/products/book-child.svg', discount: 5, rating: 4.4, ratingCount: 150, sales: 70 },
  // عطر +11
  { name: 'عطر مردانه دیور ساواج', slug: 'perfume-dior-sauvage', description: 'عطر دیور ساواج با رایحه تند و مدرن', price: 8500000, stock: 8, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 5, rating: 4.8, ratingCount: 220, sales: 85 },
  { name: 'عطر زنانه شنل 5', slug: 'perfume-chanel-5', description: 'عطر کلاسیک شنل شماره 5', price: 12000000, stock: 6, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 3, rating: 4.7, ratingCount: 190, sales: 60 },
  { name: 'عطر مردانه بلو دو شانل', slug: 'perfume-bleu-chanel', description: 'بلو دو شانل با رایحه چوبی معطر', price: 9800000, stock: 7, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 0, rating: 4.8, ratingCount: 170, sales: 55 },
  { name: 'عطر زنانه بلک اورکید', slug: 'perfume-black-orchid', description: 'عطر بلک اورکید تام فورد', price: 11500000, stock: 5, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 4, rating: 4.6, ratingCount: 120, sales: 35 },
  { name: 'اسپری بدن آدیداس', slug: 'adidas-body-spray', description: 'اسپری بدن آدیداس با رایحه ورزشی', price: 350000, stock: 40, cat: 'perfume', image: '/images/products/perfume-unisex.svg', discount: 0, rating: 4.2, ratingCount: 300, sales: 180 },
  { name: 'عطر مردانه وان میل', slug: 'perfume-one-million', description: 'عطر وان میل پاکو رابان', price: 7800000, stock: 9, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 6, rating: 4.6, ratingCount: 140, sales: 48 },
  { name: 'عطر زنانه لا وی بِل', slug: 'perfume-la-vie-belle', description: 'عطر لا وی بِل لانکوم با رایحه شیرین', price: 8900000, stock: 7, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 0, rating: 4.7, ratingCount: 130, sales: 42 },
  { name: 'ادکلن مردانه باس', slug: 'bass-cologne', description: 'ادکلن مردانه باس با رایحه خنک', price: 450000, stock: 35, cat: 'perfume', image: '/images/products/perfume-unisex.svg', discount: 5, rating: 4.1, ratingCount: 180, sales: 95 },
  { name: 'عطر یونیسکس نرولی', slug: 'perfume-neroli', description: 'عطر یونیسکس نرولی پورتوفینو', price: 6800000, stock: 10, cat: 'perfume', image: '/images/products/perfume-unisex.svg', discount: 7, rating: 4.5, ratingCount: 110, sales: 38 },
  { name: 'عطر مردانه اینوانتیس', slug: 'perfume-invictus', description: 'عطر اینوانتیس پاکو رابان', price: 7200000, stock: 8, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 0, rating: 4.5, ratingCount: 100, sales: 32 },
  { name: 'عطر زنانه گود گرل', slug: 'perfume-good-girl', description: 'عطر گود گرل کارولینا هررا', price: 8200000, stock: 6, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 3, rating: 4.6, ratingCount: 90, sales: 28 },
  // اسباب‌بازی +10
  { name: 'سازمان رباتیک لگو', slug: 'lego-robot', description: 'سازمان رباتیک لگو با موتور و سنسور', price: 3200000, stock: 8, cat: 'toys', image: '/images/products/lego.svg', discount: 8, rating: 4.7, ratingCount: 75, sales: 25 },
  { name: 'بازی فکری مونوپولی', slug: 'monopoly-board', description: 'بازی فکری مونوپولی نسخه فارسی', price: 850000, stock: 20, cat: 'toys', image: '/images/products/puzzle.svg', discount: 0, rating: 4.6, ratingCount: 130, sales: 55 },
  { name: 'عروسک خرس عروسکی', slug: 'teddy-bear', description: 'خرس عروسکی بزرگ 60 سانتی', price: 750000, stock: 15, cat: 'toys', image: '/images/products/doll.svg', discount: 5, rating: 4.7, ratingCount: 95, sales: 42 },
  { name: 'هلی‌کوپتر کنترلی', slug: 'rc-helicopter', description: 'هلی‌کوپتر کنترلی با دوربین', price: 2800000, stock: 7, cat: 'toys', image: '/images/products/rc-car.svg', discount: 10, rating: 4.3, ratingCount: 60, sales: 20 },
  { name: 'پازل سه‌بعدی برج ایفل', slug: 'puzzle-3d-eiffel', description: 'پازل سه‌بعدی برج ایفل 500 قطعه', price: 580000, stock: 18, cat: 'toys', image: '/images/products/puzzle.svg', discount: 6, rating: 4.4, ratingCount: 70, sales: 30 },
  { name: 'مجموعه آشپزخانه کودک', slug: 'kids-kitchen', description: 'مجموعه آشپزخانه پلاستیکی کودک', price: 950000, stock: 12, cat: 'toys', image: '/images/products/doll.svg', discount: 4, rating: 4.5, ratingCount: 55, sales: 22 },
  { name: 'قطار چوبی', slug: 'wooden-train', description: 'قطار چوبی با ریل کامل', price: 680000, stock: 14, cat: 'toys', image: '/images/products/lego.svg', discount: 0, rating: 4.6, ratingCount: 65, sales: 28 },
  { name: 'بازی حافظه تصویری', slug: 'memory-game', description: 'بازی فکری حافظه با 60 کارت', price: 280000, stock: 30, cat: 'toys', image: '/images/products/puzzle.svg', discount: 8, rating: 4.3, ratingCount: 85, sales: 40 },
  { name: 'ماشین پلیسی کنترل', slug: 'police-car', description: 'ماشین پلیسی کنترلی با آژیر و چراغ', price: 680000, stock: 16, cat: 'toys', image: '/images/products/rc-car.svg', discount: 0, rating: 4.4, ratingCount: 75, sales: 33 },
  { name: 'سازمان ساختنی فضایی', slug: 'space-construction', description: 'سازمان ساختنی سفینه فضایی', price: 1200000, stock: 10, cat: 'toys', image: '/images/products/lego.svg', discount: 5, rating: 4.5, ratingCount: 50, sales: 18 },
  // دکوراتیو +10
  { name: 'لامپ ال‌ای‌دی رومیزی', slug: 'led-lamp', description: 'لامپ رومیزی ال‌ای‌دی با نور قابل تنظیم', price: 850000, stock: 20, cat: 'decor', image: '/images/products/candle.svg', discount: 8, rating: 4.5, ratingCount: 90, sales: 40 },
  { name: 'آینه دکوراتیو مدرن', slug: 'modern-mirror', description: 'آینه دکوراتیو با قاب طلایی', price: 1500000, stock: 10, cat: 'decor', image: '/images/products/photo-frame.svg', discount: 0, rating: 4.6, ratingCount: 55, sales: 20 },
  { name: 'ست گلدان بتنی', slug: 'concrete-vase-set', description: 'ست 3 عددی گلدان بتنی مینیمال', price: 950000, stock: 15, cat: 'decor', image: '/images/products/vase.svg', discount: 5, rating: 4.4, ratingCount: 65, sales: 25 },
  { name: 'شمعدان شیشه‌ای', slug: 'glass-candlestick', description: 'شمعدان شیشه‌ای دست‌ساز', price: 450000, stock: 25, cat: 'decor', image: '/images/products/candle.svg', discount: 0, rating: 4.3, ratingCount: 70, sales: 32 },
  { name: 'تابلوی دیواری کالیگرافی', slug: 'calligraphy-art', description: 'تابلوی دیواری کالیگرافی فارسی', price: 1800000, stock: 8, cat: 'decor', image: '/images/products/photo-frame.svg', discount: 6, rating: 4.7, ratingCount: 45, sales: 15 },
  { name: 'ساعت دیواری مدرن', slug: 'modern-wall-clock', description: 'ساعت دیواری مدرن با عقربه‌های نازک', price: 980000, stock: 12, cat: 'decor', image: '/images/products/wall-clock.svg', discount: 4, rating: 4.5, ratingCount: 60, sales: 22 },
  { name: 'جعبه دکوری رومیزی', slug: 'decor-box', description: 'جعبه دکوری رومیزی با روکش چرم', price: 380000, stock: 30, cat: 'decor', image: '/images/products/photo-frame.svg', discount: 0, rating: 4.2, ratingCount: 50, sales: 25 },
  { name: 'فرش موکت دکوری', slug: 'decor-rug', description: 'فرش موکت دکوری با طرح مدرن', price: 2200000, stock: 10, cat: 'decor', image: '/images/products/vase.svg', discount: 8, rating: 4.4, ratingCount: 40, sales: 12 },
  { name: 'مجسمه دکوری رزین', slug: 'resin-figure', description: 'مجسمه دکوری رزین با طراحی خاص', price: 550000, stock: 20, cat: 'decor', image: '/images/products/candle.svg', discount: 0, rating: 4.3, ratingCount: 55, sales: 26 },
  { name: 'نورپردازی رومیزی', slug: 'table-light', description: 'چراغ رومیزی با نور گرم', price: 750000, stock: 18, cat: 'decor', image: '/images/products/led-lamp.svg', discount: 3, rating: 4.4, ratingCount: 65, sales: 30 },
]

async function main() {
  for (const p of MORE) {
    const cat = await prisma.category.findUnique({ where: { slug: p.cat } })
    if (!cat) continue
    const { cat: _c, image, discount, sales, ...data } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: cat.id },
      create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: cat.id },
    })
  }
  const total = await prisma.product.count()
  console.log(`More products ✅ (${MORE.length} added; total: ${total})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

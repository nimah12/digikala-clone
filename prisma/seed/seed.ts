import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const FULL_SEED_STEPS = [
  'seed-more',
  'seed-extra',
  'seed-new-cats',
  'seed-expand-full',
  'seed-fill-more',
  'seed-row-fill',
  'seed-brands',
  'seed-brand-fill',
  'seed-brand-more',
  'seed-brand-topup',
  'seed-unique-ratings',
  'seed-reviews',
  'seed-reviews-v2',
  'seed-vendors-reviews-all',
  'fix-missing-images',
  'seed-descriptions',
  'seed-balance-cats',
  'seed-subcat-fill',
  'seed-subcat-fix',
  'fix-product-images',
  'seed-subcategories',
  'seed-menu-groups',
  'seed-admin',
]

type SeedProduct = {
  name: string
  slug: string
  description: string
  price: number
  stock: number
  categorySlug: string
  image: string
  discount: number
  rating: number
  ratingCount: number
  sales: number
}

const categories: { name: string; slug: string }[] = [
  { name: 'موبایل', slug: 'mobile' },
  { name: 'لپ‌تاپ', slug: 'laptop' },
  { name: 'تبلت', slug: 'tablet' },
  { name: 'ساعت هوشمند', slug: 'smartwatch' },
  { name: 'صوتی و تصویری', slug: 'audio' },
  { name: 'خانه و آشپزخانه', slug: 'home' },
  { name: 'زیبایی و سلامت', slug: 'beauty' },
  { name: 'ورزش و سفر', slug: 'sports' },
]

const products: SeedProduct[] = [
  // موبایل
  { name: 'آیفون 15', slug: 'iphone-15', description: 'گوشی هوشمند اپل، مدل ۲۰۲۳ با تراشه A16 Bionic و دوربین ۴۸ مگاپیکسلی', price: 45000000, stock: 10, categorySlug: 'mobile', image: '/images/products/iphone-15.webp', discount: 15, rating: 4.7, ratingCount: 1280, sales: 432 },
  { name: 'سامسونگ گلکسی S24', slug: 'samsung-s24', description: 'گوشی پرچمدار سامسونگ با هوش مصنوعی Galaxy AI و دوربین ۲۰۰ مگاپیکسلی', price: 38000000, stock: 15, categorySlug: 'mobile', image: '/images/products/samsung-s24.webp', discount: 10, rating: 4.6, ratingCount: 854, sales: 310 },
  { name: 'سامسونگ گلکسی S24 اولترا', slug: 'samsung-s24-ultra', description: 'پرچمدار فوق‌حرفه‌ای سامسونگ با قلم S-Pen و صفحه‌نمایش ۶.۸ اینچی', price: 65000000, stock: 8, categorySlug: 'mobile', image: '/images/products/samsung-s24-ultra.webp', discount: 12, rating: 4.8, ratingCount: 2105, sales: 568 },
  { name: 'شیائومی 14', slug: 'xiaomi-14', description: 'گوشی هوشمند شیائومی با دوربین لایکا و تراشه Snapdragon 8 Gen 3', price: 28000000, stock: 20, categorySlug: 'mobile', image: '/images/products/xiaomi-14.webp', discount: 0, rating: 4.4, ratingCount: 623, sales: 195 },
  { name: 'گوگل پیکسل 8', slug: 'pixel-8', description: 'گوشی گوگل با دوربین محاسباتی فوق‌العاده و تجربه خالص اندروید', price: 32000000, stock: 6, categorySlug: 'mobile', image: '/images/products/pixel-8.webp', discount: 18, rating: 4.5, ratingCount: 342, sales: 87 },
  // لپ‌تاپ
  { name: 'مک‌بوک ایر M3', slug: 'macbook-air-m3', description: 'لپ‌تاپ سبک و قدرتمند اپل با تراشه M3 و ۱۸ ساعت شارژدهی', price: 72000000, stock: 5, categorySlug: 'laptop', image: '/images/products/macbook-air-m3.webp', discount: 8, rating: 4.9, ratingCount: 2310, sales: 512 },
  { name: 'مک‌بوک پرو M3', slug: 'macbook-pro-m3', description: 'لپ‌تاپ حرفه‌ای اپل با نمایشگر Liquid Retina XDR و تراشه M3 Pro', price: 115000000, stock: 3, categorySlug: 'laptop', image: '/images/products/macbook-pro-m3.webp', discount: 5, rating: 4.9, ratingCount: 1456, sales: 289 },
  { name: 'لنوو ThinkPad X1 Carbon', slug: 'thinkpad-x1', description: 'لپ‌تاپ تجاری فوق‌سبک لنوو با بدنه فیبر کربنی و ۱۴ ساعت شارژدهی', price: 88000000, stock: 7, categorySlug: 'laptop', image: '/images/products/thinkpad-x1.webp', discount: 0, rating: 4.6, ratingCount: 410, sales: 143 },
  { name: 'ایسوس ROG Strix G16', slug: 'asus-rog-g16', description: 'لپ‌تاپ گیمینگ ایسوس با RTX 4060 و نرخ تازه‌سازی ۱۶۵ هرتز', price: 98000000, stock: 4, categorySlug: 'laptop', image: '/images/products/thinkpad-x1.webp', discount: 9, rating: 4.7, ratingCount: 528, sales: 176 },
  // تبلت
  { name: 'آیپد ایر M2', slug: 'ipad-air', description: 'تبلت اپل با تراشه M2، مناسب طراحی و کار با اپل پنسل', price: 48000000, stock: 9, categorySlug: 'tablet', image: '/images/products/ipad-air.webp', discount: 6, rating: 4.8, ratingCount: 1180, sales: 356 },
  { name: 'گلکسی تب S9', slug: 'galaxy-tab-s9', description: 'تبلت اندرویدی سامسونگ با نمایشگر AMOLED و قلم S-Pen', price: 39000000, stock: 11, categorySlug: 'tablet', image: '/images/products/galaxy-tab.webp', discount: 14, rating: 4.7, ratingCount: 745, sales: 267 },
  { name: 'آیپد نسل ۱۰', slug: 'ipad-10th', description: 'آیپد اقتصادی اپل برای مطالعه و وبگردی', price: 25000000, stock: 12, categorySlug: 'tablet', image: '/images/products/ipad-air.webp', discount: 0, rating: 4.5, ratingCount: 890, sales: 402 },
  // ساعت هوشمند
  { name: 'اپل واچ سری 9', slug: 'apple-watch-9', description: 'ساعت هوشمند اپل با نمایشگر Always-On و سنجش اکسیژن خون', price: 21000000, stock: 14, categorySlug: 'smartwatch', image: '/images/products/apple-watch.webp', discount: 11, rating: 4.8, ratingCount: 1670, sales: 498 },
  { name: 'گلکسی واچ 6', slug: 'galaxy-watch-6', description: 'ساعت هوشمند سامسونگ با قابلیت پایش خواب و ورزش', price: 13500000, stock: 16, categorySlug: 'smartwatch', image: '/images/products/galaxy-watch.webp', discount: 9, rating: 4.5, ratingCount: 532, sales: 178 },
  // صوتی و تصویری
  { name: 'ایرپادز پرو ۲', slug: 'airpods-pro-2', description: 'هدفون بی‌سیم اپل با نویزکنسلینگ فعال و صدای فراگیر', price: 12800000, stock: 18, categorySlug: 'audio', image: '/images/products/airpods-pro.webp', discount: 7, rating: 4.8, ratingCount: 2450, sales: 812 },
  { name: 'سونی WH-1000XM5', slug: 'sony-wh1000xm5', description: 'هدفون حرفه‌ای سونی با بهترین نویزکنسلینگ بازار', price: 17500000, stock: 8, categorySlug: 'audio', image: '/images/products/sony-wh1000xm5.webp', discount: 13, rating: 4.9, ratingCount: 1820, sales: 435 },
  { name: 'اسپیکر JBL فلیپ ۶', slug: 'jbl-flip-6', description: 'اسپیکر بلوتوثی قابل حمل JBL با ضدآب بودن IP67', price: 5200000, stock: 22, categorySlug: 'audio', image: '/images/products/jbl-flip6.webp', discount: 0, rating: 4.6, ratingCount: 980, sales: 520 },
  { name: 'تلویزیون سامسونگ ۵۵ اینچ', slug: 'tv-samsung-55', description: 'تلویزیون هوشمند سامسونگ با کیفیت 4K و سیستم‌عامل Tizen', price: 68000000, stock: 6, categorySlug: 'audio', image: '/images/products/tv-samsung-55.webp', discount: 16, rating: 4.6, ratingCount: 640, sales: 210 },
  // خانه و آشپزخانه
  { name: 'پلوپز پارس‌خزر ۱۰ لیتری', slug: 'rice-cooker', description: 'پلوپز خانگی ۱۰ لیتری با پخت یکنواخت و ظرف نچسب', price: 4500000, stock: 25, categorySlug: 'home', image: '/images/products/rice-cooker.webp', discount: 0, rating: 4.4, ratingCount: 430, sales: 310 },
  { name: 'جاروبرقی سامسونگ', slug: 'vacuum-samsung', description: 'جاروبرقی کیسه‌ای سامسونگ با مکش قدرتمند ۲۲۰۰ وات', price: 8900000, stock: 10, categorySlug: 'home', image: '/images/products/vacuum.webp', discount: 8, rating: 4.3, ratingCount: 350, sales: 140 },
  { name: 'مخلوط‌کن فیلیپس', slug: 'blender-philips', description: 'مخلوط‌کن ۶۰۰ واتی فیلیپس با پارچ شیشه‌ای', price: 3200000, stock: 30, categorySlug: 'home', image: '/images/products/blender.webp', discount: 5, rating: 4.2, ratingCount: 280, sales: 190 },
  // زیبایی و سلامت
  { name: 'سشوار بابلیس', slug: 'hairdryer-babyliss', description: 'سشوار ۲۲۰۰ واتی بابلیس با فناوری یون و ۳ حالت حرارتی', price: 5800000, stock: 12, categorySlug: 'beauty', image: '/images/products/hairdryer.webp', discount: 12, rating: 4.5, ratingCount: 610, sales: 265 },
  { name: 'رژ لب ماتی مای', slug: 'lipstick-maybelline', description: 'رژ لب ماتی مای‌بلین نیویورک با ماندگاری ۱۶ ساعت', price: 450000, stock: 40, categorySlug: 'beauty', image: '/images/products/lipstick.webp', discount: 0, rating: 4.3, ratingCount: 720, sales: 580 },
  // ورزش و سفر
  { name: 'ست دمبل ۵ کیلویی', slug: 'dumbbells-5kg', description: 'ست دمبل ۵ کیلویی با روکش پلاستیکی ضدلغزش', price: 3800000, stock: 20, categorySlug: 'sports', image: '/images/products/dumbbells.webp', discount: 6, rating: 4.4, ratingCount: 240, sales: 130 },
  { name: 'چمدان ۲۴ اینچ', slug: 'suitcase-24', description: 'چمدان چرخ‌دار ۲۴ اینچی با جنس ABS ضدضربه', price: 4200000, stock: 14, categorySlug: 'sports', image: '/images/products/suitcase.webp', discount: 10, rating: 4.5, ratingCount: 380, sales: 220 },
  { name: 'چادر کمپینگ ۲ نفره', slug: 'tent-2p', description: 'چادر مسافرتی ۲ نفره با ضدآب بودن و حمل آسان', price: 5800000, stock: 9, categorySlug: 'sports', image: '/images/products/tent.webp', discount: 0, rating: 4.6, ratingCount: 190, sales: 95 },
]

async function main() {
  const categoryIds = new Map<string, number>()
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    })
    categoryIds.set(cat.slug, created.id)
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.image,
        discountPercent: p.discount,
        rating: p.rating,
        ratingCount: p.ratingCount,
        salesCount: p.sales,
        categoryId: categoryIds.get(p.categorySlug)!,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.image,
        discountPercent: p.discount,
        rating: p.rating,
        ratingCount: p.ratingCount,
        salesCount: p.sales,
        categoryId: categoryIds.get(p.categorySlug)!,
      },
    })
  }

  const count = await prisma.product.count()
  console.log(`Seed completed ✅ (${count} products)`)

  for (const step of FULL_SEED_STEPS) {
    console.log(`\n--- Running ${step}.ts ---`)
    execSync(`npx tsx prisma/seed/${step}.ts`, { stdio: 'inherit' })
  }

  const finalCount = await prisma.product.count()
  const catCount = await prisma.category.count()
  console.log(`\n✅ Full seed done: ${finalCount} products across ${catCount} categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

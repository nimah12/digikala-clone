import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const CATS = [
  { name: 'لوازم خانگی', slug: 'home-appliances' },
  { name: 'کتاب و لوازم تحریر', slug: 'books' },
  { name: 'عطر و ادکلن', slug: 'perfume' },
  { name: 'اسباب‌بازی', slug: 'toys' },
  { name: 'دکوراتیو', slug: 'decor' },
]

const PRODUCTS: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number }[] = [
  // لوازم خانگی
  { name: 'قهوه‌ساز دلمونگی', slug: 'coffee-maker-delonghi', description: 'قهوه‌ساز اسپرسو دلمونگی با بخارشوی و کف‌ساز شیر', price: 9800000, stock: 8, cat: 'home-appliances', image: '/images/products/coffee-maker.svg', discount: 8, rating: 4.7, ratingCount: 130, sales: 45 },
  { name: 'سرخ‌کن بدون روغن فیلیپس', slug: 'air-fryer-philips', description: 'سرخ‌کن بدون روغن 4.5 لیتری فیلیپس با 7 برنامه آماده', price: 12500000, stock: 10, cat: 'home-appliances', image: '/images/products/air-fryer.svg', discount: 12, rating: 4.8, ratingCount: 210, sales: 78 },
  { name: 'اتو بخار تفال', slug: 'steam-iron-tefal', description: 'اتو بخار تفال با کف سرامیکی و بخار قوی', price: 3200000, stock: 15, cat: 'home-appliances', image: '/images/products/iron.svg', discount: 5, rating: 4.4, ratingCount: 90, sales: 40 },
  { name: 'کتری برقی پارس‌خزر', slug: 'electric-kettle', description: 'کتری برقی 1.7 لیتری با بدنه استیل ضدزنگ', price: 980000, stock: 25, cat: 'home-appliances', image: '/images/products/kettle.svg', discount: 0, rating: 4.3, ratingCount: 150, sales: 85 },
  { name: 'مایکروویو سامسونگ', slug: 'microwave-samsung', description: 'مایکروویو 32 لیتری سامسونگ با گریل', price: 14500000, stock: 6, cat: 'home-appliances', image: '/images/products/microwave.svg', discount: 10, rating: 4.6, ratingCount: 75, sales: 28 },
  // کتاب
  { name: 'رمان صد سال تنهایی', slug: 'book-100-years', description: 'رمان جاودانه گابریل گارسیا مارکز، ترجمه فارسی', price: 480000, stock: 40, cat: 'books', image: '/images/products/book-novel.svg', discount: 5, rating: 4.9, ratingCount: 350, sales: 180 },
  { name: 'دیوان حافظ', slug: 'book-hafez', description: 'دیوان حافظ با خط نستعلیق و جلد چرمی', price: 850000, stock: 30, cat: 'books', image: '/images/products/book-poetry.svg', discount: 0, rating: 4.8, ratingCount: 420, sales: 250 },
  { name: 'هنر شفاف اندیشیدن', slug: 'book-clear-thinking', description: 'کتاب روانشناسی موفقیت رولف دوبلی', price: 390000, stock: 50, cat: 'books', image: '/images/products/book-selfhelp.svg', discount: 8, rating: 4.6, ratingCount: 280, sales: 160 },
  { name: 'مجموعه داستان کودک', slug: 'book-kids', description: 'مجموعه 10 جلدی داستان‌های آموزنده برای کودکان', price: 650000, stock: 35, cat: 'books', image: '/images/products/book-child.svg', discount: 10, rating: 4.7, ratingCount: 190, sales: 110 },
  { name: 'آموزش برنامه‌نویسی پایتون', slug: 'book-python', description: 'کتاب آموزش پایتون برای مبتدیان با مثال‌های عملی', price: 520000, stock: 45, cat: 'books', image: '/images/products/book-tech.svg', discount: 0, rating: 4.5, ratingCount: 230, sales: 140 },
  // عطر
  { name: 'عطر مردانه عود', slug: 'perfume-oud', description: 'عطر مردانه عود با رایحه گرم و ماندگار', price: 2800000, stock: 12, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 6, rating: 4.6, ratingCount: 180, sales: 75 },
  { name: 'عطر زنانه گل یاس', slug: 'perfume-jasmine', description: 'عطر زنانه با رایحه گل یاس و مشک', price: 2400000, stock: 14, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 4, rating: 4.5, ratingCount: 160, sales: 65 },
  { name: 'ادکلن یونیسکس کالونی', slug: 'perfume-cologne', description: 'ادکلن یونیسکس با رایحه مرکبات و خنک', price: 1500000, stock: 20, cat: 'perfume', image: '/images/products/perfume-unisex.svg', discount: 0, rating: 4.3, ratingCount: 120, sales: 55 },
  // اسباب‌بازی
  { name: 'لگو شهر 800 قطعه', slug: 'lego-city', description: 'لگو شهر با 800 قطعه، مناسب 6 سال به بالا', price: 1800000, stock: 10, cat: 'toys', image: '/images/products/lego.svg', discount: 10, rating: 4.8, ratingCount: 140, sales: 60 },
  { name: 'عروسک باربی', slug: 'barbie-doll', description: 'عروسک باربی کلاسیک با لباس مجلسی', price: 950000, stock: 18, cat: 'toys', image: '/images/products/doll.svg', discount: 5, rating: 4.6, ratingCount: 110, sales: 50 },
  { name: 'پازل 1000 قطعه منظره', slug: 'puzzle-1000', description: 'پازل 1000 قطعه با طرح منظره طبیعی', price: 480000, stock: 25, cat: 'toys', image: '/images/products/puzzle.svg', discount: 0, rating: 4.5, ratingCount: 95, sales: 45 },
  { name: 'ماشین کنترلی رادیویی', slug: 'rc-car', description: 'ماشین کنترلی با باتری قابل شارژ و سرعت بالا', price: 1200000, stock: 12, cat: 'toys', image: '/images/products/rc-car.svg', discount: 8, rating: 4.4, ratingCount: 85, sales: 38 },
  // دکوراتیو
  { name: 'گلدان سرامیکی مدرن', slug: 'ceramic-vase', description: 'گلدان سرامیکی با طراحی مدرن، مناسب دکور منزل', price: 750000, stock: 20, cat: 'decor', image: '/images/products/vase.svg', discount: 0, rating: 4.5, ratingCount: 70, sales: 32 },
  { name: 'ست شمع معطر', slug: 'scented-candles', description: 'ست 3 عددی شمع معطر با رایحه وانیل و دارچین', price: 450000, stock: 30, cat: 'decor', image: '/images/products/candle.svg', discount: 5, rating: 4.4, ratingCount: 85, sales: 40 },
  { name: 'قاب عکس چوبی', slug: 'wooden-photo-frame', description: 'قاب عکس چوبی با شیشه سکوریت، سایز 20×30', price: 380000, stock: 35, cat: 'decor', image: '/images/products/photo-frame.svg', discount: 0, rating: 4.3, ratingCount: 60, sales: 28 },
  { name: 'ساعت دیواری رومیزی', slug: 'wall-clock', description: 'ساعت دیواری کلاسیک با عقربه‌های برنجی', price: 1200000, stock: 15, cat: 'decor', image: '/images/products/wall-clock.svg', discount: 8, rating: 4.6, ratingCount: 95, sales: 42 },
]

const VENDORS: { productSlug: string; name: string; city: string; address: string; phone: string; rating: number; price: number; stock: number }[] = [
  { productSlug: 'coffee-maker-delonghi', name: 'کالای خانگی آذرخش', city: 'تهران', address: 'تهران، میدان تجریش', phone: '۰۲۱-۲۲۷۰۱۰۱', rating: 4.7, price: 9900000, stock: 3 },
  { productSlug: 'air-fryer-philips', name: 'الکتروپخش اصفهان', city: 'اصفهان', address: 'اصفهان، خیابان توحید', phone: '۰۳۱-۳۶۶۰۱۲', rating: 4.5, price: 12600000, stock: 4 },
  { productSlug: 'book-100-years', name: 'کتابفروشی بوستان', city: 'تهران', address: 'تهران، انقلاب اسلامی', phone: '۰۲۱-۶۶۴۰۲۰', rating: 4.8, price: 490000, stock: 10 },
  { productSlug: 'book-hafez', name: 'کتابسرای فردوسی', city: 'شیراز', address: 'شیراز، خیابان زند', phone: '۰۷۱-۳۶۵۰۰۲', rating: 4.6, price: 860000, stock: 8 },
  { productSlug: 'perfume-oud', name: 'گالری عطر رویال', city: 'تهران', address: 'تهران، فرشته', phone: '۰۲۱-۲۲۱۰۵۰', rating: 4.7, price: 2850000, stock: 4 },
  { productSlug: 'perfume-jasmine', name: 'بوتیک عطر معطر', city: 'مشهد', address: 'مشهد، بلوار وکیل‌آباد', phone: '۰۵۱-۳۸۸۱۰۰', rating: 4.4, price: 2450000, stock: 5 },
  { productSlug: 'lego-city', name: 'بازیتک تبریز', city: 'تبریز', address: 'تبریز، خیابان امام', phone: '۰۴۱-۳۵۵۵۱۰', rating: 4.6, price: 1850000, stock: 3 },
  { productSlug: 'ceramic-vase', name: 'دکورشهر کرج', city: 'کرج', address: 'کرج، عظیمیه', phone: '۰۲۶-۳۴۴۵۱۰', rating: 4.3, price: 760000, stock: 6 },
  { productSlug: 'microwave-samsung', name: 'الکتروپخش اصفهان', city: 'اصفهان', address: 'اصفهان، خیابان توحید', phone: '۰۳۱-۳۶۶۰۱۲', rating: 4.5, price: 14600000, stock: 2 },
  { productSlug: 'book-python', name: 'کتابفروشی بوستان', city: 'تهران', address: 'تهران، انقلاب اسلامی', phone: '۰۲۱-۶۶۴۰۲۰', rating: 4.8, price: 530000, stock: 12 },
]

const REVIEWS: { author: string; rating: number; title: string; text: string; verified: boolean }[] = [
  { author: 'فرزاد محمدی', rating: 5, title: 'عالی بود', text: 'کیفیت عالی و ارسال سریع. کاملاً راضی هستم.', verified: true },
  { author: 'شیرین افشار', rating: 3, title: 'متوسط', text: 'قابل قبول بود ولی با توجه به قیمت انتظار بیشتری داشتم.', verified: true },
  { author: 'آرش رضایی', rating: 4, title: 'خوب', text: 'محصول خوبیه، فقط کاش بسته‌بندی بهتری داشت.', verified: false },
  { author: 'نازنین کریمی', rating: 5, title: 'عالی', text: 'دقیقاً همون چیزی بود که می‌خواستم. ممنون از فروشگاه.', verified: true },
]

async function main() {
  const catIds = new Map<string, number>()
  for (const c of CATS) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    })
    catIds.set(c.slug, created.id)
  }

  for (const p of PRODUCTS) {
    const { cat, image, discount, sales, ...data } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: catIds.get(cat)! },
      create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: catIds.get(cat)! },
    })
  }

  for (const v of VENDORS) {
    const product = await prisma.product.findUnique({ where: { slug: v.productSlug } })
    if (!product) continue
    await prisma.vendor.create({
      data: {
        productId: product.id,
        name: v.name,
        city: v.city,
        address: v.address,
        phone: v.phone,
        rating: v.rating,
        price: v.price,
        stock: v.stock,
      },
    })
  }

  // نظرات برای محصولات جدید
  let reviewCount = 0
  const newProducts = await prisma.product.findMany({ where: { categoryId: { in: [...catIds.values()] } } })
  for (const product of newProducts) {
    const n = 2 + (product.id % 2)
    for (let i = 0; i < n; i++) {
      const r = REVIEWS[(product.id + i) % REVIEWS.length]
      await prisma.review.create({
        data: {
          productId: product.id,
          author: r.author,
          date: `۱۴۰۳/${String(1 + (product.id % 12)).padStart(2, '0')}/${String(1 + i * 8).padStart(2, '0')}`,
          rating: r.rating,
          title: r.title,
          text: r.text,
          verified: r.verified,
        },
      })
      reviewCount++
    }
  }

  const total = await prisma.product.count()
  console.log(`New cats ✅ (${CATS.length} categories, ${PRODUCTS.length} products, ${VENDORS.length} vendors, ${reviewCount} reviews; total products: ${total})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

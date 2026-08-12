import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PRODUCTS: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number }[] = [
  // پوشاک — 5 محصول
  { name: 'تیشرت پنبه‌ای مردانه', slug: 'tshirt-men-cotton', description: 'تیشرت پنبه‌ای مردانه با نخ مرغوب و بافت تنفس‌پذیر، راحتی و دوام را در یک پوشش ساده روزمره فراهم می‌کند. یقه و دوخت با کیفیت، فرم خود را حتی پس از شست‌وشوهای متعدد حفظ می‌کند. مناسب استفاده روزانه و ست‌شدن با انواع شلوار و کفش.', price: 780000, stock: 30, cat: 'clothing', image: '/images/products/tshirt.svg', discount: 0, rating: 4.3, ratingCount: 85, sales: 40 },
  { name: 'کت اسپرت مردانه', slug: 'sports-jacket-men', description: 'کت اسپرت مردانه با طراحی مدرن و پارچه مقاوم، ظاهری شیک و کاربردی برای فصول سرد ارائه می‌دهد. آستر داخلی نرم و برش مناسب، گرمای مطبوع و راحتی حرکت را تضمین می‌کند. انتخابی ایده‌آل برای استایل‌های روزمره و نیمه‌رسمی.', price: 2800000, stock: 15, cat: 'clothing', image: '/images/products/jacket.svg', discount: 8, rating: 4.6, ratingCount: 70, sales: 25 },
  { name: 'کلاه بیسبال مردانه', slug: 'baseball-cap-men', description: 'کلاه بیسبال مردانه با طراحی کلاسیک و تهویه مناسب، انتخابی محبوب برای محافظت از سر در برابر آفتاب است. بند تنظیم اندازه، استفاده راحت برای هر سایزی را ممکن می‌سازد. همراهی سبک و کاربردی برای استایل روزمره و ورزش.', price: 450000, stock: 40, cat: 'clothing', image: '/images/products/cap-men.svg', discount: 0, rating: 4.2, ratingCount: 60, sales: 35 },
  { name: 'جوراب ورزشی (ست ۳ عددی)', slug: 'sports-socks-3pk', description: 'ست جوراب ورزشی شامل ۳ جفت با بافت تقویت‌شده در نواحی پاشنه و پنجه، راحتی بالایی در تمرین و پیاده‌روی فراهم می‌کند. الیاف تنفس‌پذیر رطوبت را دفع کرده و از ایجاد بوی نامطبوع جلوگیری می‌کند.', price: 320000, stock: 60, cat: 'clothing', image: '/images/products/sport-socks.svg', discount: 10, rating: 4.4, ratingCount: 90, sales: 55 },
  { name: 'شال ابریشمی زنانه', slug: 'silk-scarf-women', description: 'شال ابریشمی زنانه با بافت لطیف و درخشش ملایم، جلوهای شیک و زنانه به استایل می‌بخشد. لبه‌های تمیز و دوخت دقیق، ظاهر مرتبی را در طولانی‌مدت حفظ می‌کند. مناسب موقعیت‌های روزمره و مجالس.', price: 1100000, stock: 20, cat: 'clothing', image: '/images/products/silk-scarf.svg', discount: 5, rating: 4.5, ratingCount: 50, sales: 20 },
  // خانه و آشپزخانه — 3 محصول
  { name: 'قهوه‌ساز اسپرسو دلمونگی', slug: 'coffee-maker-delonghi', description: 'قهوه‌ساز اسپرسو دلمونگی با فشار بالا و بخار حرفه‌ای، اسپرسو و کاپوچینوی کافه‌ای را در خانه تهیه می‌کند. مخزن قابل جداسازی و قطعات بادوام، تمیزکاری و نگهداری را ساده کرده است.', price: 9800000, stock: 8, cat: 'home', image: '/images/products/coffee-maker.svg', discount: 8, rating: 4.7, ratingCount: 130, sales: 45 },
  { name: 'مایکروویو سامسونگ', slug: 'microwave-samsung', description: 'مایکروویو سامسونگ با ظرفیت مناسب و عملکرد یکنواخت، پخت‌وپز و گرم‌کردن غذا را سریع و راحت می‌کند. پنل کنترل ساده و برنامه‌های آماده، استفاده از آن را برای همه آسان می‌سازد.', price: 14500000, stock: 6, cat: 'home', image: '/images/products/microwave.svg', discount: 10, rating: 4.6, ratingCount: 75, sales: 28 },
  { name: 'سرخ‌کن بدون روغن فیلیپس', slug: 'air-fryer-philips', description: 'سرخ‌کن بدون روغن فیلیپس با فناوری گردش هوای گرم، غذاهای ترد و خوشمزه با روغن بسیار کم آماده می‌کند. ظرف بزرگ با روکش نچسب و پنل دیجیتال، پخت را ساده و سالم می‌کند.', price: 12500000, stock: 10, cat: 'home', image: '/images/products/air-fryer.svg', discount: 12, rating: 4.8, ratingCount: 210, sales: 78 },
]

async function main() {
  let count = 0
  for (const p of PRODUCTS) {
    const cat = await prisma.category.findUnique({ where: { slug: p.cat } })
    if (!cat) continue
    const { cat: _c, image, discount, sales, ...data } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: cat.id },
      create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: cat.id },
    })
    count++
  }
  const byCat = await prisma.category.findMany({
    select: { slug: true, name: true, _count: { select: { products: true } } },
  })
  for (const c of byCat.sort((a, b) => a._count.products - b._count.products)) {
    console.log(`${c._count.products}\t${c.name}`)
  }
  console.log(`Balance cats ✅ (${count} added; total: ${await prisma.product.count()})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

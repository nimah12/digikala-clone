import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// محصولات برندها — برای اینکه جستجوی هر برند خالی نباشد
const BRAND_PRODUCTS: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number; brand: string }[] = [
  // اپل
  { name: 'آیپد پرو M4', slug: 'ipad-pro-m4', description: 'تبلت حرفه‌ای اپل با تراشه M4', price: 78000000, stock: 4, cat: 'tablet', image: '/images/products/ipad-air.svg', discount: 5, rating: 4.9, ratingCount: 85, sales: 20, brand: 'اپل' },
  { name: 'ایرپادز ۳', slug: 'airpods-3', description: 'ایرپادز نسل ۳ با صدای فضایی', price: 8500000, stock: 15, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 8, rating: 4.7, ratingCount: 200, sales: 90, brand: 'اپل' },
  { name: 'مک‌مینی M2', slug: 'mac-mini-m2', description: 'مک‌مینی با تراشه M2، کامپیوتر کوچک قدرتمند', price: 45000000, stock: 6, cat: 'laptop', image: '/images/products/macbook-air-m3.svg', discount: 0, rating: 4.8, ratingCount: 70, sales: 25, brand: 'اپل' },
  // سامسونگ
  { name: 'گلکسی A54', slug: 'galaxy-a54', description: 'گوشی میان‌رده سامسونگ با دوربین عالی', price: 15000000, stock: 20, cat: 'mobile', image: '/images/products/samsung-s24.svg', discount: 10, rating: 4.5, ratingCount: 300, sales: 150, brand: 'سامسونگ' },
  { name: 'گلکسی بادز 2', slug: 'galaxy-buds2', description: 'هدفون بی‌سیم سامسونگ با نویزکنسلینگ', price: 4500000, stock: 18, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 12, rating: 4.4, ratingCount: 180, sales: 85, brand: 'سامسونگ' },
  { name: 'مانیتور سامسونگ', slug: 'samsung-monitor', description: 'مانیتور 27 اینچ سامسونگ', price: 12000000, stock: 8, cat: 'audio', image: '/images/products/tv-samsung-55.svg', discount: 6, rating: 4.5, ratingCount: 90, sales: 35, brand: 'سامسونگ' },
  // شیائومی
  { name: 'ردمی نوت 13', slug: 'redmi-note-13', description: 'گوشی اقتصادی شیائومی با نمایشگر AMOLED', price: 8500000, stock: 25, cat: 'mobile', image: '/images/products/xiaomi-14.svg', discount: 8, rating: 4.4, ratingCount: 400, sales: 220, brand: 'شیائومی' },
  { name: 'اسکوتر برقی شیائومی', slug: 'xiaomi-scooter', description: 'اسکوتر برقی شیائومی با برد 30 کیلومتر', price: 18000000, stock: 5, cat: 'sports', image: '/images/products/suitcase.svg', discount: 5, rating: 4.6, ratingCount: 60, sales: 18, brand: 'شیائومی' },
  { name: 'پاوربانک شیائومی', slug: 'xiaomi-powerbank', description: 'پاوربانک 20000 میلی‌آمپر شیائومی', price: 1800000, stock: 30, cat: 'mobile', image: '/images/products/xiaomi-14.svg', discount: 0, rating: 4.5, ratingCount: 250, sales: 130, brand: 'شیائومی' },
  // لنوو
  { name: 'لپ‌تاپ لنوو آیدیاپد', slug: 'lenovo-ideapad', description: 'لپ‌تاپ لنوو آیدیاپد با Ryzen 5', price: 28000000, stock: 8, cat: 'laptop', image: '/images/products/thinkpad-x1.svg', discount: 7, rating: 4.4, ratingCount: 110, sales: 40, brand: 'لنوو' },
  { name: 'تبلت لنوو تب', slug: 'lenovo-tab', description: 'تبلت لنوو با نمایشگر 11 اینچ', price: 8500000, stock: 12, cat: 'tablet', image: '/images/products/galaxy-tab.svg', discount: 5, rating: 4.3, ratingCount: 80, sales: 30, brand: 'لنوو' },
  { name: 'موس بی‌سیم لنوو', slug: 'lenovo-mouse', description: 'موس بی‌سیم لنوو', price: 350000, stock: 40, cat: 'laptop', image: '/images/products/watch-classic.svg', discount: 0, rating: 4.2, ratingCount: 120, sales: 60, brand: 'لنوو' },
  // نایک
  { name: 'کفش نایک فری', slug: 'nike-free', description: 'کفش دویدن نایک فری ران', price: 4800000, stock: 10, cat: 'fashion', image: '/images/products/shoes.svg', discount: 10, rating: 4.6, ratingCount: 150, sales: 60, brand: 'نایک' },
  { name: 'تی‌شرت نایک', slug: 'nike-tshirt', description: 'تی‌شرت نایک مردانه', price: 750000, stock: 20, cat: 'clothing', image: '/images/products/tshirt.svg', discount: 5, rating: 4.4, ratingCount: 100, sales: 45, brand: 'نایک' },
  { name: 'کوله نایک', slug: 'nike-backpack', description: 'کوله پشتی نایک ورزشی', price: 2800000, stock: 12, cat: 'sports', image: '/images/products/suitcase.svg', discount: 8, rating: 4.5, ratingCount: 70, sales: 28, brand: 'نایک' },
  // آدیداس
  { name: 'کفش آدیداس سوپراستار', slug: 'adidas-superstar', description: 'کفش کلاسیک آدیداس سوپراستار', price: 5200000, stock: 10, cat: 'fashion', image: '/images/products/shoes.svg', discount: 12, rating: 4.7, ratingCount: 180, sales: 70, brand: 'آدیداس' },
  { name: 'شلوار آدیداس', slug: 'adidas-pants', description: 'شلوار اسپرت آدیداس', price: 1500000, stock: 15, cat: 'clothing', image: '/images/products/jeans.svg', discount: 0, rating: 4.3, ratingCount: 80, sales: 35, brand: 'آدیداس' },
  { name: 'کلاه آدیداس', slug: 'adidas-cap', description: 'کلاه بیسبال آدیداس', price: 450000, stock: 25, cat: 'fashion', image: '/images/products/tshirt.svg', discount: 5, rating: 4.2, ratingCount: 90, sales: 40, brand: 'آدیداس' },
  // سونی
  { name: 'هدفون سونی XM4', slug: 'sony-xm4', description: 'هدفون سونی WH-1000XM4', price: 12500000, stock: 8, cat: 'audio', image: '/images/products/sony-wh1000xm5.svg', discount: 10, rating: 4.8, ratingCount: 220, sales: 85, brand: 'سونی' },
  { name: 'پلی‌استیشن 5', slug: 'ps5', description: 'کنسول پلی‌استیشن 5 با دو دسته', price: 42000000, stock: 4, cat: 'gpu', image: '/images/products/rtx4070.svg', discount: 0, rating: 4.9, ratingCount: 300, sales: 100, brand: 'سونی' },
  { name: 'اسپیکر سونی', slug: 'sony-speaker', description: 'اسپیکر بلوتوثی سونی', price: 5800000, stock: 12, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 6, rating: 4.5, ratingCount: 90, sales: 35, brand: 'سونی' },
  // بوش
  { name: 'دریل بوش 750 وات', slug: 'bosch-drill-750', description: 'دریل چکشی بوش 750 وات', price: 6500000, stock: 10, cat: 'tools', image: '/images/products/drill.svg', discount: 8, rating: 4.7, ratingCount: 120, sales: 45, brand: 'بوش' },
  { name: 'پیچ‌گوشتی بوش', slug: 'bosch-screwdriver', description: 'پیچ‌گوشتی برقی بوش', price: 2800000, stock: 15, cat: 'tools', image: '/images/products/screwdriver-set.svg', discount: 0, rating: 4.5, ratingCount: 80, sales: 32, brand: 'بوش' },
  { name: 'جارو بوش', slug: 'bosch-vacuum', description: 'جاروبرقی بوش', price: 12000000, stock: 6, cat: 'home-appliances', image: '/images/products/vacuum.svg', discount: 5, rating: 4.6, ratingCount: 60, sales: 20, brand: 'بوش' },
  // جی‌بی‌ال
  { name: 'اسپیکر JBL Go 3', slug: 'jbl-go-3', description: 'اسپیکر کوچک JBL Go 3', price: 1800000, stock: 25, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 8, rating: 4.4, ratingCount: 200, sales: 95, brand: 'جی‌بی‌ال' },
  { name: 'هدفون JBL Tune', slug: 'jbl-tune', description: 'هدفون JBL Tune 510BT', price: 2200000, stock: 20, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 5, rating: 4.3, ratingCount: 150, sales: 70, brand: 'جی‌بی‌ال' },
  { name: 'اسپیکر JBL PartyBox', slug: 'jbl-partybox', description: 'اسپیکر مهمانی JBL PartyBox 100', price: 18000000, stock: 5, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 6, rating: 4.7, ratingCount: 55, sales: 15, brand: 'جی‌بی‌ال' },
  // ایسوس
  { name: 'لپ‌تاپ ایسوس ویووبوک', slug: 'asus-vivobook', description: 'لپ‌تاپ ایسوس ویووبوک با Core i5', price: 25000000, stock: 10, cat: 'laptop', image: '/images/products/thinkpad-x1.svg', discount: 5, rating: 4.4, ratingCount: 100, sales: 38, brand: 'ایسوس' },
  { name: 'مادربرد ایسوس', slug: 'asus-motherboard', description: 'مادربرد ایسوس Z790', price: 12000000, stock: 7, cat: 'gpu', image: '/images/products/gtx1660.svg', discount: 0, rating: 4.6, ratingCount: 50, sales: 18, brand: 'ایسوس' },
  { name: 'مانیتور ایسوس', slug: 'asus-monitor', description: 'مانیتور گیمینگ ایسوس 27 اینچ', price: 13500000, stock: 8, cat: 'gpu', image: '/images/products/tv-samsung-55.svg', discount: 7, rating: 4.5, ratingCount: 70, sales: 25, brand: 'ایسوس' },
  // تفال
  { name: 'ماهی‌تابه تفال', slug: 'tefal-pan', description: 'ماهی‌تابه تفال با روکش تیتانیوم', price: 2800000, stock: 20, cat: 'home-appliances', image: '/images/products/air-fryer.svg', discount: 0, rating: 4.5, ratingCount: 130, sales: 55, brand: 'تفال' },
  { name: 'قابلمه تفال', slug: 'tefal-pot', description: 'ست قابلمه تفال 5 تکه', price: 8500000, stock: 8, cat: 'home-appliances', image: '/images/products/kettle.svg', discount: 8, rating: 4.6, ratingCount: 85, sales: 30, brand: 'تفال' },
  { name: 'کباب‌پز تفال', slug: 'tefal-grill', description: 'کباب‌پز برقی تفال', price: 5800000, stock: 10, cat: 'home-appliances', image: '/images/products/air-fryer.svg', discount: 5, rating: 4.4, ratingCount: 60, sales: 22, brand: 'تفال' },
  // پاناسونیک
  { name: 'سشوار پاناسونیک', slug: 'panasonic-hairdryer', description: 'سشوار پاناسونیک با یون', price: 3800000, stock: 12, cat: 'home-appliances', image: '/images/products/hairdryer.svg', discount: 6, rating: 4.5, ratingCount: 90, sales: 35, brand: 'پاناسونیک' },
  { name: 'پلوپز پاناسونیک', slug: 'panasonic-rice-cooker', description: 'پلوپز پاناسونیک 1.8 لیتری', price: 5200000, stock: 15, cat: 'home-appliances', image: '/images/products/rice-cooker.svg', discount: 0, rating: 4.6, ratingCount: 140, sales: 60, brand: 'پاناسونیک' },
  { name: 'مایکروویو پاناسونیک', slug: 'panasonic-microwave', description: 'مایکروویو پاناسونیک 30 لیتری', price: 16000000, stock: 5, cat: 'home-appliances', image: '/images/products/microwave.svg', discount: 4, rating: 4.5, ratingCount: 55, sales: 18, brand: 'پاناسونیک' },
]

async function main() {
  let count = 0
  for (const p of BRAND_PRODUCTS) {
    const cat = await prisma.category.findUnique({ where: { slug: p.cat } })
    if (!cat) continue
    const { cat: _c, image, discount, sales, brand: _brand, ...data } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: cat.id },
      create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: cat.id },
    })
    count++
  }
  const total = await prisma.product.count()
  console.log(`Brand products ✅ (${count} added; total: ${total})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

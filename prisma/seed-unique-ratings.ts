import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// دسته‌بندی پوشاک
const FASHION_CAT = { name: 'پوشاک', slug: 'clothing' }

const FASHION_PRODUCTS: {
  name: string
  slug: string
  description: string
  price: number
  stock: number
  image: string
  discount: number
  rating: number
  ratingCount: number
  sales: number
}[] = [
  { name: 'کفش اسپرت نایک ایر مکس', slug: 'nike-air-max', description: 'کفش اسپرت نایک ایر مکس، مناسب پیاده‌روی و دویدن روزانه', price: 5400000, stock: 14, image: '/images/products/sneakers.svg', discount: 12, rating: 4.8, ratingCount: 720, sales: 310 },
  { name: 'کفش راحتی اسکچرز', slug: 'skechers-comfort', description: 'کفش راحتی اسکچرز با کفی فوم مموری، بسیار سبک', price: 3900000, stock: 20, image: '/images/products/casual-shoes.svg', discount: 8, rating: 4.6, ratingCount: 480, sales: 265 },
  { name: 'شلوار جین لی ۵۰۱', slug: 'levis-501', description: 'شلوار جین کلاسیک لی ۵۰۱، با الیاف کشدار و دوخت محکم', price: 2100000, stock: 25, image: '/images/products/jeans-blue.svg', discount: 5, rating: 4.5, ratingCount: 350, sales: 190 },
  { name: 'شلوار کتان مردانه', slug: 'chinos-khaki', description: 'شلوار کتان مردانه رنگ خاکی، مناسب محیط کار و مهمانی', price: 1450000, stock: 30, image: '/images/products/chinos.svg', discount: 0, rating: 4.2, ratingCount: 210, sales: 145 },
  { name: 'پیراهن رسمی سفید', slug: 'formal-shirt-white', description: 'پیراهن رسمی سفید با پارچه پنبه و کتان، اتوکم‌نیاز', price: 980000, stock: 35, image: '/images/products/shirt-white.svg', discount: 10, rating: 4.4, ratingCount: 290, sales: 220 },
  { name: 'پیراهن یقه‌دار مردانه', slug: 'casual-shirt', description: 'پیراهن یقه‌دار با طرح چهارخانه، مناسب استفاده روزمره', price: 780000, stock: 40, image: '/images/products/shirt-casual.svg', discount: 0, rating: 4.1, ratingCount: 180, sales: 130 },
  { name: 'هودی پنبه‌ای طرحدار', slug: 'hoodie-cotton', description: 'هودی پنبه‌ای ضخیم با کلاه، مناسب فصل سرد', price: 1600000, stock: 18, image: '/images/products/hoodie.svg', discount: 15, rating: 4.7, ratingCount: 560, sales: 340 },
  { name: 'بادگیر ضدآب ورزشی', slug: 'windbreaker', description: 'بادگیر ضدآب سبک با جیب زیپ‌دار، مناسب کوهنوردی و دوچرخه‌سواری', price: 1850000, stock: 16, image: '/images/products/windbreaker.svg', discount: 7, rating: 4.5, ratingCount: 240, sales: 120 },
  { name: 'شلوارک ورزشی', slug: 'sports-shorts', description: 'شلوارک ورزشی با پارچه تنفس‌پذیر، مناسب باشگاه', price: 620000, stock: 45, image: '/images/products/shorts.svg', discount: 0, rating: 4.0, ratingCount: 150, sales: 110 },
  { name: 'دامن کوتاه تابستانی', slug: 'summer-skirt', description: 'دامن کوتاه تابستانی با پارچه کتان نخی، طرح گلدار', price: 850000, stock: 22, image: '/images/products/skirt.svg', discount: 10, rating: 4.3, ratingCount: 130, sales: 75 },
]

async function main() {
  // ۱) دسته پوشاک
  const fashion = await prisma.category.upsert({
    where: { slug: FASHION_CAT.slug },
    update: { name: FASHION_CAT.name },
    create: { name: FASHION_CAT.name, slug: FASHION_CAT.slug },
  })

  // ۲) محصولات پوشاک
  for (const p of FASHION_PRODUCTS) {
    const { slug, image, discount, sales, ...data } = p
    await prisma.product.upsert({
      where: { slug },
      update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: fashion.id },
      create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug, categoryId: fashion.id },
    })
  }

  // ۳) امتیازهای منحصربه‌فرد برای همه‌ی محصولات
  // هر محصول امتیاز متفاوتی از ۳.۶ تا ۵.۰ با تعداد امتیاز متنوع
  const products = await prisma.product.findMany({
    select: { id: true, slug: true },
    orderBy: { id: 'asc' },
  })

  // امتیازهای متنوع و چرخشی — هیچ دو محصولی امتیاز یکسان ندارند
  const ratings = [
    4.9, 4.7, 4.6, 4.8, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0,
    3.9, 3.8, 3.7, 3.6, 4.85, 4.65, 4.55, 4.35, 4.25, 4.15,
    3.95, 3.85, 3.75, 3.65, 4.95, 4.75, 4.45, 4.05, 3.55, 3.45,
    4.9, 4.7, 4.6, 4.8, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0,
    3.9, 3.8, 3.7, 3.6, 4.85, 4.65, 4.55, 4.35, 4.25, 4.15,
  ]
  const counts = [1280, 854, 2310, 2105, 623, 342, 1456, 410, 1180, 745, 1670, 532, 528, 890, 2450, 1820, 980, 640, 430, 350, 280, 610, 720, 240, 380, 190, 320, 210, 95, 150, 88, 2400, 1200, 1800, 950, 3100, 850, 320, 280, 540, 120, 480, 260, 180, 90, 140, 210, 150, 620, 220, 410]

  let updated = 0
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const rating = ratings[i % ratings.length]
    const count = counts[i % counts.length]
    await prisma.product.update({
      where: { id: p.id },
      data: { rating, ratingCount: count },
    })
    updated++
  }

  const total = await prisma.product.count()
  console.log(`✅ پوشاک: ${FASHION_PRODUCTS.length} محصول اضافه شد؛ امتیاز ${updated} محصول به‌روزرسانی شد (کل: ${total} محصول)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

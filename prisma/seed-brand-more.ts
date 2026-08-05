import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// پر کردن برندها تا هرکدام حداقل ۵ محصول داشته باشند
const PRODUCTS: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number }[] = [
  // اپل +4
  { name: 'اپل واچ SE', slug: 'apple-watch-se', description: 'اپل واچ SE با نمایشگر رتینا', price: 14500000, stock: 8, cat: 'smartwatch', image: '/images/products/apple-watch.svg', discount: 6, rating: 4.6, ratingCount: 130, sales: 45 },
  { name: 'مک‌بوک ایر M2', slug: 'macbook-air-m2', description: 'مک‌بوک ایر با تراشه M2', price: 62000000, stock: 5, cat: 'laptop', image: '/images/products/macbook-air-m3.svg', discount: 4, rating: 4.8, ratingCount: 200, sales: 60 },
  { name: 'آیفون 14', slug: 'iphone-14', description: 'آیفون 14 با تراشه A15', price: 39000000, stock: 10, cat: 'mobile', image: '/images/products/iphone-15.svg', discount: 8, rating: 4.6, ratingCount: 350, sales: 150 },
  { name: 'اپل تی‌وی 4K', slug: 'apple-tv-4k', description: 'اپل تی‌وی 4K با کیفیت HDR', price: 9500000, stock: 6, cat: 'audio', image: '/images/products/tv-samsung-55.svg', discount: 0, rating: 4.5, ratingCount: 60, sales: 20 },
  // شیائومی +2
  { name: 'شیائومی بند 8', slug: 'mi-band-8', description: 'دستبند هوشمند شیائومی بند 8', price: 1200000, stock: 25, cat: 'smartwatch', image: '/images/products/galaxy-watch.svg', discount: 5, rating: 4.5, ratingCount: 300, sales: 150 },
  { name: 'ساعت شیائومی واچ', slug: 'xiaomi-watch', description: 'ساعت هوشمند شیائومی با AMOLED', price: 6800000, stock: 10, cat: 'smartwatch', image: '/images/products/apple-watch.svg', discount: 7, rating: 4.4, ratingCount: 120, sales: 40 },
  // لنوو +2
  { name: 'لپ‌تاپ لنوو لژیون', slug: 'lenovo-legion', description: 'لپ‌تاپ گیمینگ لنوو لژیون', price: 55000000, stock: 4, cat: 'laptop', image: '/images/products/thinkpad-x1.svg', discount: 8, rating: 4.6, ratingCount: 70, sales: 20 },
  { name: 'کیبورد لنوو', slug: 'lenovo-keyboard', description: 'کیبورد بی‌سیم لنوو', price: 750000, stock: 20, cat: 'laptop', image: '/images/products/watch-classic.svg', discount: 0, rating: 4.3, ratingCount: 90, sales: 40 },
  // سونی +2
  { name: 'دوربین سونی A7', slug: 'sony-a7', description: 'دوربین بدون آینه سونی A7 III', price: 85000000, stock: 3, cat: 'audio', image: '/images/products/tv-samsung-55.svg', discount: 0, rating: 4.9, ratingCount: 40, sales: 8 },
  { name: 'کنسول PS4', slug: 'ps4', description: 'کنسول پلی‌استیشن 4', price: 15000000, stock: 5, cat: 'gpu', image: '/images/products/rtx4070.svg', discount: 10, rating: 4.5, ratingCount: 150, sales: 50 },
  // ایسوس +1
  { name: 'روتر ایسوس', slug: 'asus-router', description: 'روتر وای‌فای ایسوس AC2900', price: 7800000, stock: 8, cat: 'gpu', image: '/images/products/gtx1660.svg', discount: 5, rating: 4.5, ratingCount: 60, sales: 22 },
  // تفال +1
  { name: 'کتری تفال', slug: 'tefal-kettle', description: 'کتری برقی تفال با بدنه استیل', price: 1800000, stock: 15, cat: 'home-appliances', image: '/images/products/kettle.svg', discount: 0, rating: 4.4, ratingCount: 110, sales: 50 },
  // پاناسونیک +1
  { name: 'اتو پاناسونیک', slug: 'panasonic-iron', description: 'اتو بخار پاناسونیک', price: 2800000, stock: 12, cat: 'home-appliances', image: '/images/products/iron.svg', discount: 4, rating: 4.3, ratingCount: 70, sales: 28 },
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
  const total = await prisma.product.count()
  console.log(`Brand more ✅ (${count} added; total: ${total})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

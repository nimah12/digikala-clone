import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PRODUCTS: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number }[] = [
  // اپل +2
  { name: 'آیفون 13', slug: 'iphone-13', description: 'آیفون 13 با تراشه A15', price: 29000000, stock: 12, cat: 'mobile', image: '/images/products/iphone-15.svg', discount: 12, rating: 4.5, ratingCount: 500, sales: 220 },
  { name: 'هوم‌پاد مینی', slug: 'homepod-mini', description: 'اسپیکر هوشمند اپل هوم‌پاد مینی', price: 8500000, stock: 6, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 5, rating: 4.6, ratingCount: 55, sales: 18 },
  // شیائومی +1
  { name: 'هدفون شیائومی', slug: 'xiaomi-earbuds', description: 'هدفون بی‌سیم شیائومی', price: 1800000, stock: 22, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 8, rating: 4.3, ratingCount: 150, sales: 70 },
  // سونی +1
  { name: 'کنسول PS5 دیجیتال', slug: 'ps5-digital', description: 'پلی‌استیشن 5 نسخه دیجیتال', price: 36000000, stock: 5, cat: 'gpu', image: '/images/products/rtx4070.svg', discount: 0, rating: 4.8, ratingCount: 200, sales: 60 },
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
  console.log(`Brand topup ✅ (${count} added; total: ${total})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

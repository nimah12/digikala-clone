import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PRODUCTS: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number }[] = [
  // آدیداس — 6 محصول
  { name: 'کفش آدیداس اولترابوست', slug: 'adidas-ultraboost', description: 'کفش دویدن آدیداس اولترابوست با کفی بوست', price: 6800000, stock: 8, cat: 'fashion', image: '/images/products/shoes.svg', discount: 10, rating: 4.7, ratingCount: 160, sales: 65, },
  { name: 'کفش آدیداس گزل', slug: 'adidas-gazelle', description: 'کفش کلاسیک آدیداس گزل', price: 4800000, stock: 10, cat: 'fashion', image: '/images/products/shoes.svg', discount: 6, rating: 4.5, ratingCount: 120, sales: 50 },
  { name: 'تی‌شرت آدیداس', slug: 'adidas-originals-tshirt', description: 'تی‌شرت آدیداس اورجینال', price: 1200000, stock: 20, cat: 'clothing', image: '/images/products/tshirt.svg', discount: 5, rating: 4.4, ratingCount: 140, sales: 60 },
  { name: 'هودی آدیداس', slug: 'adidas-hoodie', description: 'هودی آدیداس با کلاه', price: 2400000, stock: 12, cat: 'clothing', image: '/images/products/hoodie.svg', discount: 8, rating: 4.6, ratingCount: 100, sales: 40 },
  { name: 'شلوارک آدیداس', slug: 'adidas-shorts', description: 'شلوارک ورزشی آدیداس', price: 850000, stock: 25, cat: 'clothing', image: '/images/products/shorts.svg', discount: 0, rating: 4.3, ratingCount: 90, sales: 45 },
  { name: 'کوله آدیداس', slug: 'adidas-backpack', description: 'کوله پشتی آدیداس', price: 2200000, stock: 10, cat: 'sports', image: '/images/products/suitcase.svg', discount: 5, rating: 4.4, ratingCount: 60, sales: 25 },
  // JBL — 5 محصول
  { name: 'اسپیکر JBL Charge 5', slug: 'jbl-charge-5', description: 'اسپیکر JBL Charge 5 با باتری 20 ساعته', price: 6800000, stock: 10, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 8, rating: 4.7, ratingCount: 180, sales: 75 },
  { name: 'هدفون JBL Live 660', slug: 'jbl-live-660', description: 'هدفون JBL Live 660 با نویزکنسلینگ', price: 4800000, stock: 12, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 6, rating: 4.5, ratingCount: 130, sales: 55 },
  { name: 'اسپیکر JBL Clip 4', slug: 'jbl-clip-4', description: 'اسپیکر کلیپی JBL Clip 4', price: 2200000, stock: 20, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 0, rating: 4.4, ratingCount: 200, sales: 95 },
  { name: 'هدفون JBL Quantum', slug: 'jbl-quantum', description: 'هدست گیمینگ JBL Quantum', price: 5800000, stock: 8, cat: 'gpu', image: '/images/products/airpods-pro.svg', discount: 10, rating: 4.5, ratingCount: 80, sales: 30 },
  { name: 'اسپیکر JBL Boombox', slug: 'jbl-boombox', description: 'اسپیکر بزرگ JBL Boombox 3', price: 25000000, stock: 4, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 5, rating: 4.8, ratingCount: 45, sales: 12 },
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
  console.log(`Brand fill ✅ (${count} added; total: ${total})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

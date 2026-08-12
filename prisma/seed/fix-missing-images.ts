import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const CATEGORY_IMAGE: Record<string, string> = {
  audio: '/images/categories/audio.svg',
  beauty: '/images/categories/beauty.svg',
  books: '/images/categories/books.svg',
  camera: '/images/categories/camera.svg',
  clothing: '/images/categories/clothing.svg',
  decor: '/images/categories/decor.svg',
  fashion: '/images/categories/fashion.svg',
  'gold-silver': '/images/categories/gold-silver.svg',
  gpu: '/images/categories/gpu.svg',
  home: '/images/categories/home.svg',
  'home-appliances': '/images/categories/home-appliances.svg',
  laptop: '/images/categories/laptop.svg',
  mobile: '/images/categories/mobile.svg',
  perfume: '/images/categories/perfume.svg',
  smartwatch: '/images/categories/smartwatch.svg',
  sports: '/images/categories/sports.svg',
  supermarket: '/images/categories/supermarket.svg',
  tablet: '/images/categories/tablet.svg',
  tools: '/images/categories/tools.svg',
  toys: '/images/categories/toys.svg',
}

const FALLBACK = '/images/categories/mobile.svg'

async function main() {
  const products = await prisma.product.findMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
    include: { category: true },
  })

  let fixed = 0
  for (const p of products) {
    const target = CATEGORY_IMAGE[p.category?.slug ?? ''] ?? FALLBACK
    await prisma.product.update({
      where: { id: p.id },
      data: { imageUrl: target },
    })
    fixed++
  }

  console.log(`Fixed ${fixed} products without images (category-based)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

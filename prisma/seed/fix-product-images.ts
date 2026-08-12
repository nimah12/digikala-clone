import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// هر دسته‌بندی یک تصویر تمیز و یکپارچه دارد (بدون متن)
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
    include: { category: true },
  })

  let fixed = 0
  const report: string[] = []

  for (const p of products) {
    const target = CATEGORY_IMAGE[p.category?.slug ?? ''] ?? FALLBACK
    if (p.imageUrl !== target) {
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: target },
      })
      fixed++
      report.push(`${p.slug}: ${p.imageUrl ?? '(none)'} -> ${target}`)
    }
  }

  console.log(`Fixed ${fixed} product images to category-based images`)
  for (const line of report.slice(0, 15)) console.log('  ' + line)
  if (report.length > 15) console.log(`  ... and ${report.length - 15} more`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

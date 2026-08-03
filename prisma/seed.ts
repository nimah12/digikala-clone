import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const mobile = await prisma.category.upsert({
    where: { slug: 'mobile' },
    update: {},
    create: { name: 'موبایل', slug: 'mobile' },
  })

  const laptop = await prisma.category.upsert({
    where: { slug: 'laptop' },
    update: {},
    create: { name: 'لپ‌تاپ', slug: 'laptop' },
  })

  await prisma.product.upsert({
    where: { slug: 'iphone-15' },
    update: {},
    create: {
      name: 'آیفون 15',
      slug: 'iphone-15',
      description: 'گوشی هوشمند اپل، مدل ۲۰۲۳',
      price: 45000000,
      stock: 10,
      categoryId: mobile.id,
    },
  })

  await prisma.product.upsert({
    where: { slug: 'samsung-s24' },
    update: {},
    create: {
      name: 'سامسونگ گلکسی S24',
      slug: 'samsung-s24',
      description: 'گوشی پرچمدار سامسونگ',
      price: 38000000,
      stock: 15,
      categoryId: mobile.id,
    },
  })

  await prisma.product.upsert({
    where: { slug: 'macbook-air-m3' },
    update: {},
    create: {
      name: 'مک‌بوک ایر M3',
      slug: 'macbook-air-m3',
      description: 'لپ‌تاپ سبک و قدرتمند اپل',
      price: 72000000,
      stock: 5,
      categoryId: laptop.id,
    },
  })

  console.log('Seed completed ✅')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// گروه‌های مگامنو مطابق کانفیگ استاتیک (src/lib/categories.ts)
// تا هدر فروشگاه از دیتابیس (پنل ادمین) تغذیه شود نه از fallback استاتیک.
const GROUPS: { title: string; icon: string; slugs: string[] }[] = [
  {
    title: 'کالای دیجیتال',
    icon: 'phone',
    slugs: [
      'mobile',
      'laptop',
      'tablet',
      'smartwatch',
      'audio',
      'camera',
      'gpu',
      'computer-accessories',
    ],
  },
  {
    title: 'خانه و آشپزخانه',
    icon: 'home',
    slugs: ['home', 'home-appliances', 'decor'],
  },
  {
    title: 'مد و پوشاک',
    icon: 't-shirt',
    slugs: ['clothing', 'fashion'],
  },
  {
    title: 'زیبایی و سلامت',
    icon: 'spray',
    slugs: ['beauty', 'perfume'],
  },
  {
    title: 'ورزش و سفر',
    icon: 'shoe',
    slugs: ['sports'],
  },
  {
    title: 'کتاب و لوازم تحریر',
    icon: 'book',
    slugs: ['books'],
  },
  {
    title: 'مادر و کودک',
    icon: 'gift',
    slugs: ['toys'],
  },
  {
    title: 'سوپرمارکت',
    icon: 'basket',
    slugs: ['supermarket'],
  },
  {
    title: 'طلا و نقره',
    icon: 'coins',
    slugs: ['gold-silver'],
  },
  {
    title: 'ابزارآلات',
    icon: 'wrench',
    slugs: ['tools'],
  },
]

async function main() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, slug: true },
  })
  const bySlug = new Map(categories.map((c) => [c.slug, c.id]))

  let created = 0
  let assigned = 0

  for (let i = 0; i < GROUPS.length; i++) {
    const g = GROUPS[i]
    const group = await prisma.menuGroup.upsert({
      where: { title: g.title },
      update: { icon: g.icon, order: i },
      create: { title: g.title, icon: g.icon, order: i },
    })
    created++

    for (const slug of g.slugs) {
      const catId = bySlug.get(slug)
      if (!catId) {
        console.log(`  [skip] دسته با slug «${slug}» در دیتابیس نیست`)
        continue
      }
      await prisma.category.update({
        where: { id: catId },
        data: { groupId: group.id },
      })
      assigned++
    }
  }

  const total = await prisma.menuGroup.count()
  console.log(`MenuGroups done: ${created} created (${total} total), ${assigned} categories assigned`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

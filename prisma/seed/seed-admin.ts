import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// کاربر دمو (ورود یک‌کلیک صفحه لاگین) باید ادمین باشد تا بتواند
// پنل مدیریت را ببیند؛ چون همه‌ی API های ادمین requireAdmin دارند.
async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@digikala-clone.local' },
    update: { role: 'admin' },
    create: { email: 'demo@digikala-clone.local', name: 'کاربر دمو', password: null, role: 'admin' },
  })
  console.log(`Demo admin ready: ${user.email} (role=${user.role}, id=${user.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

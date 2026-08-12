import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// بازسازی کامل مگامنو در دیتابیس از کانفیگ استاتیک (src/lib/categories.ts)
// تا هدر فروشگاه و پنل ادمین هر دو از دیتابیس تغذیه شوند.
// به‌جای upsert بر اساس slug، اول با نام (و parentId) پیدا می‌کند تا با
// دسته‌هایی که در دیتابیس موجودند اما slug متفاوت دارند تداخل نکند
// (دیتابیس ممکن است از سید قبلی نام داشته باشد ولی slug استاندارد نداشته باشد).
type Section = { slug: string; name: string; icon: string; subcategories: string[] }

const MEGA_MENU: Section[] = [
  { slug: 'mobile', name: 'موبایل', icon: 'phone', subcategories: ['آیفون', 'سامسونگ', 'شیائومی', 'آنر', 'گوگل پیکسل'] },
  { slug: 'laptop', name: 'لپ‌تاپ', icon: 'laptop', subcategories: ['لنوو', 'ایسوس', 'مک‌بوک', 'اچ‌پی', 'دل'] },
  { slug: 'tablet', name: 'تبلت', icon: 'tablet', subcategories: ['آیپد', 'گلکسی تب', 'لنوو تب'] },
  { slug: 'smartwatch', name: 'ساعت هوشمند', icon: 'watch', subcategories: ['اپل واچ', 'گلکسی واچ', 'گارمین'] },
  { slug: 'audio', name: 'صوتی و تصویری', icon: 'headphones', subcategories: ['هدفون', 'اسپیکر', 'تلویزیون', 'ساندبار'] },
  { slug: 'camera', name: 'دوربین و تصویر', icon: 'camera', subcategories: ['دوربین عکاسی', 'اکشن‌کم', 'دوربین مداربسته'] },
  { slug: 'gpu', name: 'کارت گرافیک و گیمینگ', icon: 'gamepad', subcategories: ['کارت گرافیک', 'مانیتور', 'کنسول', 'گیمینگ', 'مادربرد'] },
  { slug: 'computer-accessories', name: 'لوازم جانبی کامپیوتر', icon: 'monitor', subcategories: ['ماوس', 'کیبورد', 'فلش مموری', 'هارد اکسترنال'] },
  { slug: 'home-appliances', name: 'لوازم خانگی', icon: 'coffee', subcategories: ['اتو', 'کتری', 'سشوار', 'پلوپز', 'مایکروویو'] },
  { slug: 'home', name: 'خانه و آشپزخانه', icon: 'home', subcategories: ['جارو', 'مخلوط‌کن', 'سرخ‌کن', 'یخچال', 'ماشین لباسشویی'] },
  { slug: 'decor', name: 'دکوراتیو', icon: 'lamp', subcategories: ['گلدان', 'شمع', 'ساعت دیواری', 'رومیزی', 'آینه'] },
  { slug: 'clothing', name: 'پوشاک', icon: 'shirt', subcategories: ['مردانه', 'پیراهن', 'شلوار', 'کفش', 'هودی'] },
  { slug: 'fashion', name: 'لباس و مد', icon: 't-shirt', subcategories: ['کفش', 'آدیداس', 'زنانه', 'مردانه', 'چرم'] },
  { slug: 'beauty', name: 'زیبایی و سلامت', icon: 'spray', subcategories: ['عطر', 'فیلیپس', 'اصلاح', 'مراقبت پوست', 'مو'] },
  { slug: 'perfume', name: 'عطر و ادکلن', icon: 'sparkles', subcategories: ['عطر مردانه', 'عطر زنانه', 'ادکلن', 'یونیسکس'] },
  { slug: 'sports', name: 'ورزش و سفر', icon: 'shoe', subcategories: ['کوله', 'کمپینگ', 'دوچرخه', 'فوتبال', 'یوگا'] },
  { slug: 'books', name: 'کتاب و لوازم تحریر', icon: 'book', subcategories: ['داستان', 'رمان', 'کتاب', 'هنر', 'کودک'] },
  { slug: 'toys', name: 'اسباب‌بازی', icon: 'gift', subcategories: ['لگو', 'عروسک', 'پازل', 'ماشین کنترلی'] },
  { slug: 'supermarket', name: 'سوپرمارکت', icon: 'basket', subcategories: ['روغن', 'چای', 'قهوه', 'شیر', 'برنج'] },
  { slug: 'gold-silver', name: 'طلا و نقره', icon: 'coins', subcategories: ['سکه', 'شمش', 'انگشتر', 'نقره', 'گردنبند'] },
  { slug: 'tools', name: 'ابزارآلات', icon: 'wrench', subcategories: ['دریل', 'پیچ‌گوشتی', 'شارژی', 'جعبه ابزار'] },
]

const GROUPS: { title: string; icon: string; slugs: string[] }[] = [
  { title: 'کالای دیجیتال', icon: 'phone', slugs: ['mobile', 'laptop', 'tablet', 'smartwatch', 'audio', 'camera', 'gpu', 'computer-accessories'] },
  { title: 'خانه و آشپزخانه', icon: 'home', slugs: ['home', 'home-appliances', 'decor'] },
  { title: 'مد و پوشاک', icon: 't-shirt', slugs: ['clothing', 'fashion'] },
  { title: 'زیبایی و سلامت', icon: 'spray', slugs: ['beauty', 'perfume'] },
  { title: 'ورزش و سفر', icon: 'shoe', slugs: ['sports'] },
  { title: 'کتاب و لوازم تحریر', icon: 'book', slugs: ['books'] },
  { title: 'مادر و کودک', icon: 'gift', slugs: ['toys'] },
  { title: 'سوپرمارکت', icon: 'basket', slugs: ['supermarket'] },
  { title: 'طلا و نقره', icon: 'coins', slugs: ['gold-silver'] },
  { title: 'ابزارآلات', icon: 'wrench', slugs: ['tools'] },
]

const FA_MAP: Record<string, string> = {
  ا: 'a', آ: 'a', ب: 'b', پ: 'p', ت: 't', ث: 's', ج: 'j', چ: 'ch', ح: 'h', خ: 'kh',
  د: 'd', ذ: 'z', ر: 'r', ز: 'z', ژ: 'zh', س: 's', ش: 'sh', ص: 's', ض: 'z', ط: 't',
  ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'gh', ک: 'k', گ: 'g', ل: 'l', م: 'm', ن: 'n',
  و: 'v', ه: 'h', ی: 'y', ئ: 'y', ' ': '-',
}
function slugify(input: string): string {
  let out = ''
  for (const ch of input.trim().toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) out += ch
    else if (FA_MAP[ch] !== undefined) out += FA_MAP[ch]
    else out += '-'
  }
  return out
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

// پیدا کردن دسته با slug یا (نام + والد) تا با داده‌های موجود تداخل نکند
async function findOrCreateRoot(sec: Section, groupId: number | null) {
  const bySlug = await prisma.category.findUnique({ where: { slug: sec.slug } })
  if (bySlug) {
    return prisma.category.update({
      where: { id: bySlug.id },
      data: { name: sec.name, icon: sec.icon, groupId, parentId: null },
    })
  }
  const byName = await prisma.category.findFirst({
    where: { parentId: null, name: sec.name },
  })
  if (byName) {
    return prisma.category.update({
      where: { id: byName.id },
      data: { slug: sec.slug, icon: sec.icon, groupId },
    })
  }
  return prisma.category.create({
    data: { name: sec.name, slug: sec.slug, icon: sec.icon, groupId, parentId: null },
  })
}

async function findOrCreateChild(parentId: number, name: string, childSlug: string, order: number) {
  const bySlug = await prisma.category.findUnique({ where: { slug: childSlug } })
  if (bySlug) {
    return prisma.category.update({
      where: { id: bySlug.id },
      data: { name, parentId, order },
    })
  }
  const byName = await prisma.category.findFirst({
    where: { parentId, name },
  })
  if (byName) {
    return prisma.category.update({
      where: { id: byName.id },
      data: { slug: childSlug, order },
    })
  }
  return prisma.category.create({
    data: { name, slug: childSlug, icon: 'tag', parentId, order },
  })
}

async function main() {
  // 1) گروه‌ها
  const groupIdByTitle = new Map<string, number>()
  for (let i = 0; i < GROUPS.length; i++) {
    const g = GROUPS[i]
    const group = await prisma.menuGroup.upsert({
      where: { title: g.title },
      update: { icon: g.icon, order: i },
      create: { title: g.title, icon: g.icon, order: i },
    })
    groupIdByTitle.set(g.title, group.id)
  }
  const groupForSlug = new Map<string, number>()
  for (const g of GROUPS) {
    const gid = groupIdByTitle.get(g.title)!
    for (const s of g.slugs) groupForSlug.set(s, gid)
  }

  // 2) دسته‌های ریشه
  for (const sec of MEGA_MENU) {
    const groupId = groupForSlug.get(sec.slug) ?? null
    await findOrCreateRoot(sec, groupId)
  }

  // 3) ساب‌دسته‌ها به‌صورت Category children
  let subs = 0
  for (const sec of MEGA_MENU) {
    const parent = await prisma.category.findUnique({ where: { slug: sec.slug } })
    if (!parent) continue
    let order = 0
    for (const name of sec.subcategories) {
      const childSlug = `${sec.slug}-${slugify(name)}`
      await findOrCreateChild(parent.id, name, childSlug, order)
      subs++
      order++
    }
  }

  const groupsTotal = await prisma.menuGroup.count()
  const catsTotal = await prisma.category.count({ where: { parentId: null } })
  const subsTotal = await prisma.category.count({ where: { parentId: { not: null } } })
  console.log(`Mega menu rebuilt: ${groupsTotal} groups, ${catsTotal} root categories, ${subsTotal} subcategories (${subs} processed)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

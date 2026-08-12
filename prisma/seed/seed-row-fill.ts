import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// پر کردن ردیف‌ها: گیمینگ +۹، پوشاک +۴، طلا +۹ = ۲۲ محصول جدید تا هر ردیف ۱۴ تایی شود
const MORE: { name: string; slug: string; description: string; price: number; stock: number; cat: string; image: string; discount: number; rating: number; ratingCount: number; sales: number }[] = [
  // گیمینگ (۹ تا)
  { name: 'کارت گرافیک RTX 4090', slug: 'rtx-4090', description: 'قوی‌ترین کارت گرافیک انویدیا، 24GB با DLSS 3', price: 115000000, stock: 2, cat: 'gpu', image: '/images/products/rtx4070.svg', discount: 0, rating: 5.0, ratingCount: 89, sales: 12 },
  { name: 'کارت گرافیک RX 7900 XTX', slug: 'rx-7900xtx', description: 'پرچمدار ای‌ام‌دی با 24GB و عملکرد 4K', price: 82000000, stock: 3, cat: 'gpu', image: '/images/products/rx6700xt.svg', discount: 5, rating: 4.7, ratingCount: 110, sales: 25 },
  { name: 'کارت گرافیک RTX 3060', slug: 'rtx-3060', description: 'کارت اقتصادی انویدیا با 12GB مناسب گیمینگ 1080p', price: 13500000, stock: 14, cat: 'gpu', image: '/images/products/rtx4060.svg', discount: 12, rating: 4.6, ratingCount: 480, sales: 210 },
  { name: 'کارت گرافیک GTX 1650', slug: 'gtx-1650', description: 'کارت ورودی انویدیا برای سیستم‌های اقتصادی', price: 6800000, stock: 20, cat: 'gpu', image: '/images/products/gtx1660.svg', discount: 10, rating: 4.2, ratingCount: 350, sales: 180 },
  { name: 'کارت گرافیک RX 6600', slug: 'rx-6600', description: 'ای‌ام‌دی اقتصادی با 8GB مناسب 1080p', price: 11500000, stock: 16, cat: 'gpu', image: '/images/products/rx580.svg', discount: 8, rating: 4.4, ratingCount: 290, sales: 140 },
  { name: 'کیس گیمینگ گرین', slug: 'gaming-case', description: 'کیس گیمینگ با شیشه سکوریت و 4 فن RGB', price: 6800000, stock: 10, cat: 'gpu', image: '/images/products/toolbox.svg', discount: 6, rating: 4.5, ratingCount: 160, sales: 65 },
  { name: 'مانیتور گیمینگ 165Hz', slug: 'gaming-monitor', description: 'مانیتور 27 اینچ Full HD با نرخ تازه‌سازی 165 هرتز', price: 11500000, stock: 8, cat: 'gpu', image: '/images/products/tv-samsung-55.svg', discount: 15, rating: 4.7, ratingCount: 220, sales: 95 },
  { name: 'هدست گیمینگ ریزر', slug: 'gaming-headset', description: 'هدست گیمینگ با صدای 7.1 و میکروفن قابل جداسازی', price: 5800000, stock: 12, cat: 'gpu', image: '/images/products/airpods-pro.svg', discount: 0, rating: 4.5, ratingCount: 190, sales: 80 },
  { name: 'موس گیمینگ لاجیتک', slug: 'gaming-mouse', description: 'موس گیمینگ با 16000DPI و 6 دکمه قابل برنامه‌ریزی', price: 2900000, stock: 18, cat: 'gpu', image: '/images/products/watch-classic.svg', discount: 5, rating: 4.6, ratingCount: 260, sales: 120 },
  // پوشاک (۴ تا)
  { name: 'کفش چلسی چرم', slug: 'chelsea-boots', description: 'چکمه چلسی چرم طبیعی، مناسب پاییز و زمستان', price: 4200000, stock: 10, cat: 'clothing', image: '/images/products/casual-shoes.svg', discount: 8, rating: 4.5, ratingCount: 85, sales: 40 },
  { name: 'شلوار کتان سفید', slug: 'chinos-white', description: 'شلوار کتان سفید با دوخت دقیق، مناسب مهمانی', price: 1550000, stock: 15, cat: 'clothing', image: '/images/products/chinos.svg', discount: 0, rating: 4.1, ratingCount: 70, sales: 35 },
  { name: 'پیراهن پولو مردانه', slug: 'polo-shirt', description: 'پیراهن پولو با یقه‌ایستاده و پارچه تنفس‌پذیر', price: 890000, stock: 25, cat: 'clothing', image: '/images/products/shirt-casual.svg', discount: 5, rating: 4.2, ratingCount: 95, sales: 55 },
  { name: 'هودی زمستانی مردانه', slug: 'hoodie-winter', description: 'هودی ضخیم با آستر فلیس، مناسب سرمای شدید', price: 1850000, stock: 12, cat: 'clothing', image: '/images/products/hoodie.svg', discount: 10, rating: 4.6, ratingCount: 140, sales: 70 },
  // طلا و نقره (۹ تا)
  { name: 'سکه نیم‌بهار آزادی', slug: 'gold-half-coin', description: 'سکه نیم‌بهار آزادی با عیار 900 و کد اصالت', price: 128000000, stock: 4, cat: 'gold-silver', image: '/images/products/gold-coin.svg', discount: 0, rating: 4.8, ratingCount: 150, sales: 22 },
  { name: 'سکه ربع بهار آزادی', slug: 'gold-quarter-coin', description: 'سکه ربع بهار آزادی، مناسب سرمایه‌گذاری خرد', price: 65000000, stock: 6, cat: 'gold-silver', image: '/images/products/gold-coin.svg', discount: 0, rating: 4.7, ratingCount: 120, sales: 18 },
  { name: 'شمش طلا ۵ گرمی', slug: 'gold-bar-5g', description: 'شمش طلا 5 گرمی با عیار 750 و گواهی اصالت', price: 46000000, stock: 8, cat: 'gold-silver', image: '/images/products/gold-bar.svg', discount: 2, rating: 4.9, ratingCount: 90, sales: 15 },
  { name: 'انگشتر نقره مردانه', slug: 'silver-ring-m', description: 'انگشتر نقره 925 با طرح اسکلت، مردانه', price: 1800000, stock: 20, cat: 'gold-silver', image: '/images/products/silver-chain.svg', discount: 5, rating: 4.3, ratingCount: 110, sales: 60 },
  { name: 'گوشواره طلا زنانه', slug: 'gold-earrings', description: 'گوشواره طلا با وزن تقریبی 2 گرم، عیار 750', price: 9800000, stock: 10, cat: 'gold-silver', image: '/images/products/gold-ring.svg', discount: 3, rating: 4.6, ratingCount: 75, sales: 28 },
  { name: 'ست طلا نوزاد', slug: 'gold-baby-set', description: 'ست طلا نوزاد شامل النگو و پای‌انداز', price: 12500000, stock: 7, cat: 'gold-silver', image: '/images/products/gold-bracelet.svg', discount: 0, rating: 4.7, ratingCount: 60, sales: 20 },
  { name: 'گردنبند طلا زنانه', slug: 'gold-necklace', description: 'گردنبند طلا ظریف با وزن تقریبی 3 گرم', price: 14200000, stock: 9, cat: 'gold-silver', image: '/images/products/gold-ring.svg', discount: 4, rating: 4.5, ratingCount: 85, sales: 30 },
  { name: 'پلاک طلا مردانه', slug: 'gold-pendant', description: 'پلاک طلا مردانه با طرح خاص، وزن 4 گرم', price: 18500000, stock: 6, cat: 'gold-silver', image: '/images/products/gold-bracelet.svg', discount: 0, rating: 4.4, ratingCount: 55, sales: 16 },
  { name: 'سرویس نقره نقره‌ساز', slug: 'silver-set', description: 'سرویس نقره 925 شامل دستبند و النگو', price: 5600000, stock: 12, cat: 'gold-silver', image: '/images/products/silver-chain.svg', discount: 8, rating: 4.5, ratingCount: 70, sales: 32 },
]

async function main() {
  for (const p of MORE) {
    const cat = await prisma.category.findUnique({ where: { slug: p.cat } })
    if (!cat) continue
    const { cat: _cat, image, discount, sales, ...data } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: cat.id },
      create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: cat.id },
    })
  }
  const total = await prisma.product.count()
  console.log(`Row fill ✅ (${MORE.length} products added; total: ${total})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

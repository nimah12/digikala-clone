import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const CITIES = ['تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'رشت']

const SHOP_NAMES = [
  'فروشگاه دیجی‌تک', 'مارکت آنلاین پارس', 'فروشگاه تکنو', 'شاپ آنلاین مهر',
  'بوتیک استور', 'فروشگاه مدرن', 'هایپرمارکت دیجیتال', 'فروشگاه اینترنتی آریا',
  'شاپینگ سنتر', 'فروشگاه آسان', 'مارکت پلاس', 'فروشگاه روز',
]

const REVIEWS = [
  { author: 'فرزاد محمدی', rating: 5, title: 'عالی بود', text: 'کیفیت عالی و ارسال سریع. کاملاً راضی هستم.', verified: true },
  { author: 'شیرین افشار', rating: 3, title: 'متوسط', text: 'قابل قبول بود ولی با توجه به قیمت انتظار بیشتری داشتم.', verified: true },
  { author: 'آرش رضایی', rating: 4, title: 'خوب', text: 'محصول خوبیه، فقط کاش بسته‌بندی بهتری داشت.', verified: false },
  { author: 'نازنین کریمی', rating: 5, title: 'عالی', text: 'دقیقاً همون چیزی بود که می‌خواستم. ممنون از فروشگاه.', verified: true },
  { author: 'رضا نادری', rating: 4, title: 'راضی هستم', text: 'ارسال به موقع و محصول مطابق توضیحات.', verified: true },
  { author: 'مریم صادقی', rating: 5, title: 'پیشنهاد می‌کنم', text: 'از خریدم خیلی راضی‌ام. حتماً دوباره خرید می‌کنم.', verified: true },
]

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, price: true } })

  let vendorCount = 0
  let reviewCount = 0

  for (const product of products) {
    const hasVendor = await prisma.vendor.findFirst({ where: { productId: product.id } })

    if (!hasVendor) {
      // ۱-۲ فروشنده برای هر محصول
      const n = 1 + (product.id % 2)
      for (let i = 0; i < n; i++) {
        const city = CITIES[(product.id + i) % CITIES.length]
        const shop = SHOP_NAMES[(product.id + i) % SHOP_NAMES.length]
        const priceDelta = (product.id % 5) - 2 // -2 تا +2 درصد
        const vendorPrice = Math.round(product.price * (1 + priceDelta / 100))
        await prisma.vendor.create({
          data: {
            productId: product.id,
            name: shop,
            city,
            address: `${city}، خیابان اصلی، پلاک ${10 + (product.id % 90)}`,
            phone: `۰۲۱-${String(10000000 + product.id * 137).slice(0, 8)}`,
            rating: 4 + (product.id % 10) / 10,
            price: vendorPrice,
            stock: 1 + (product.id % 15),
          },
        })
        vendorCount++
      }
    }

    const reviewCountForProduct = await prisma.review.count({ where: { productId: product.id } })
    if (reviewCountForProduct === 0) {
      const n = 2 + (product.id % 2)
      for (let i = 0; i < n; i++) {
        const r = REVIEWS[(product.id + i) % REVIEWS.length]
        await prisma.review.create({
          data: {
            productId: product.id,
            author: r.author,
            date: `۱۴۰۳/${String(1 + (product.id % 12)).padStart(2, '0')}/${String(1 + i * 8).padStart(2, '0')}`,
            rating: r.rating,
            title: r.title,
            text: r.text,
            verified: r.verified,
          },
        })
        reviewCount++
      }
    }
  }

  const total = await prisma.product.count()
  const withVendor = await prisma.vendor.groupBy({ by: ['productId'] })
  const withReview = await prisma.review.groupBy({ by: ['productId'] })
  console.log(`All covered ✅ (${vendorCount} vendors, ${reviewCount} reviews added; ${withVendor.length}/${total} with vendor, ${withReview.length}/${total} with review)`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

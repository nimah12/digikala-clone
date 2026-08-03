import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// نظرات جدید: ترکیبی از مثبت، منفی و مختلط — برای همه‌ی محصولات جدید
const REVIEW_POOL: { author: string; rating: number; title: string; text: string; verified: boolean }[] = [
  { author: 'رضا نادری', rating: 5, title: 'خرید عالی', text: 'دقیقاً مطابق توضیحات بود و بسته‌بندی خیلی خوبی داشت. از این فروشگاه راضی‌ام.', verified: true },
  { author: 'زهرا کاظمی', rating: 4, title: 'خوب بود، ولی...', text: 'کیفیت خوبه و قیمتش منصفانه. فقط کاش ارسال کمی سریع‌تر بود. در کل راضی‌ام.', verified: true },
  { author: 'محمد رستمی', rating: 2, title: 'انتظار بیشتری داشتم', text: 'متأسفانه از کیفیتش راضی نبودم. با توجه به قیمت، انتظار بهتری داشتم. شاید برای من مناسب نبود.', verified: true },
  { author: 'الهام شریفی', rating: 3, title: 'متوسط بود', text: 'محصول بد نیست، ولی نسبت به رقیب‌هایش چیز خاصی نداره. اگه تخفیف داشته باشه ارزش خرید داره.', verified: false },
  { author: 'کیان قاسمی', rating: 5, title: 'ارزش خرید بالا', text: 'بعد از مقایسه با چند گزینه دیگر، بهترین انتخاب بود. پشتیبانی هم سریع جواب داد.', verified: true },
  { author: 'نازنین یوسفی', rating: 1, title: 'رضایت نداشتم', text: 'متأسفانه کالا دیر رسید و بسته‌بندی هم آسیب دیده بود. امیدوارم تجربه بعدی بهتر باشه.', verified: true },
  { author: 'پدرام عزیزی', rating: 4, title: 'کیفیت خوب، یک ایراد کوچک', text: 'کارایی‌اش عالیه و از خریدم راضی‌ام. فقط یک مورد جزئی بود که با پشتیبانی در تماس حل شد.', verified: true },
  { author: 'مریم صادقی', rating: 3, title: 'قابل قبول', text: 'برای استفاده روزمره کافیه، ولی اگه به دنبال بهترین کیفیت هستید گزینه‌های گران‌تری هم هست.', verified: true },
  { author: 'امید فرهادی', rating: 5, title: 'همه‌چیز عالی', text: 'از خرید تا تحویل همه‌چیز روان و سریع بود. حتماً دوباره از دیجی‌کلون خرید می‌کنم.', verified: true },
  { author: 'سپیده رحیمی', rating: 2, title: 'مشکل در گارانتی', text: 'محصول به نظر خوب می‌رسید، ولی توضیحات گارانتی شفاف نبود و برای پیگیری مشکل داشتم.', verified: true },
]

async function main() {
  // حذف نظرات قدیمی تکراری برای محصولات قدیمی تا ترکیب بهتری داشته باشیم
  // فقط نظرات مربوط به محصولات جدید را اضافه می‌کنیم
  const products = await prisma.product.findMany({
    select: { id: true, slug: true },
  })

  const newProductIds = new Set<number>()
  for (const p of products) {
    if (p.slug.includes('-') && !['iphone-15', 'samsung-s24', 'macbook-air-m3', 'samsung-s24-ultra', 'xiaomi-14', 'pixel-8', 'macbook-pro-m3', 'thinkpad-x1', 'ipad-air', 'galaxy-tab-s9', 'apple-watch-9', 'galaxy-watch-6', 'asus-rog-g16', 'ipad-10th', 'airpods-pro-2', 'sony-wh1000xm5', 'jbl-flip-6', 'tv-samsung-55', 'rice-cooker', 'vacuum-samsung', 'blender-philips', 'hairdryer-babyliss', 'lipstick-maybelline', 'dumbbells-5kg', 'suitcase-24', 'tent-2p'].includes(p.slug)) {
      newProductIds.add(p.id)
    }
  }

  // clear any reviews previously added by this script for these products,
  // so re-running it doesn't create duplicates
  await prisma.review.deleteMany({ where: { productId: { in: Array.from(newProductIds) } } })

  let count = 0
  for (const productId of newProductIds) {
    // ۲ تا ۳ نظر جدید برای هر محصول جدید، با ترکیبی از مثبت/منفی
    const n = 2 + (productId % 2)
    const offset = productId % REVIEW_POOL.length
    for (let i = 0; i < n; i++) {
      const r = REVIEW_POOL[(offset + i) % REVIEW_POOL.length]
      await prisma.review.create({
        data: {
          productId,
          author: r.author,
          date: `${1403 - (i % 2)}/${String(1 + ((productId + i) % 12)).padStart(2, '0')}/${String(2 + i * 6).padStart(2, '0')}`,
          rating: r.rating,
          title: r.title,
          text: r.text,
          verified: r.verified,
        },
      })
      count++
    }
  }

  console.log(`Reviews v2 seeded ✅ (${count} new reviews)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

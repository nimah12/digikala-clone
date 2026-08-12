import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type SeedCategory = { name: string; slug: string; icon: string }
type SeedProduct = {
  name: string
  slug: string
  description: string
  price: number
  stock: number
  categorySlug: string
  image: string
  discount: number
  rating: number
  ratingCount: number
  sales: number
}
type SeedVendor = {
  productSlug: string
  name: string
  city: string
  address: string
  phone: string
  rating: number
  price: number
  stock: number
}

const newCategories: SeedCategory[] = [
  { name: 'طلا و نقره', slug: 'gold-silver', icon: '🥇' },
  { name: 'سوپرمارکت', slug: 'supermarket', icon: '🛒' },
  { name: 'لباس و مد', slug: 'fashion', icon: '👕' },
  { name: 'ابزارآلات', slug: 'tools', icon: '🔧' },
  { name: 'کارت گرافیک و گیمینگ', slug: 'gpu', icon: '🎮' },
]

const newProducts: SeedProduct[] = [
  // طلا و نقره
  { name: 'سکه طلا طرح بهار آزادی', slug: 'gold-coin', description: 'سکه تمام‌بهار آزادی با عیار ۹۰۰، ضرب بانک مرکزی با کد اصالت', price: 245000000, stock: 5, categorySlug: 'gold-silver', image: '/images/products/gold-coin.svg', discount: 0, rating: 4.9, ratingCount: 320, sales: 45 },
  { name: 'شمش طلا یک گرمی', slug: 'gold-bar-1g', description: 'شمش طلا یک گرمی با عیار ۷۵۰، همراه با گواهی اصالت', price: 9200000, stock: 15, categorySlug: 'gold-silver', image: '/images/products/gold-bar.svg', discount: 0, rating: 4.8, ratingCount: 210, sales: 67 },
  { name: 'انگشتر طلا طرح زنجیره', slug: 'gold-ring', description: 'انگشتر طلا با وزن تقریبی ۳ گرم، عیار ۷۵۰ با کارت اصالت', price: 14500000, stock: 8, categorySlug: 'gold-silver', image: '/images/products/gold-ring.svg', discount: 5, rating: 4.6, ratingCount: 95, sales: 23 },
  { name: 'گردنبند نقره نقره‌ساز', slug: 'silver-chain', description: 'گردنبند نقره ۹۲۵ با طرح مدرن، ضدحساسیت', price: 3200000, stock: 20, categorySlug: 'gold-silver', image: '/images/products/silver-chain.svg', discount: 8, rating: 4.4, ratingCount: 150, sales: 58 },
  { name: 'دستبند طلا مردانه', slug: 'gold-bracelet', description: 'دستبند طلا مردانه با وزن تقریبی ۵ گرم، عیار ۷۵۰', price: 24000000, stock: 6, categorySlug: 'gold-silver', image: '/images/products/gold-bracelet.svg', discount: 0, rating: 4.7, ratingCount: 88, sales: 19 },
  // سوپرمارکت
  { name: 'ماکارونی ایتالیانا', slug: 'pasta-italyana', description: 'ماکارونی فرمی ایتالیانا ۸۰۰ گرم، تهیه‌شده از گندم دوروم', price: 78000, stock: 100, categorySlug: 'supermarket', image: '/images/products/pasta.svg', discount: 10, rating: 4.5, ratingCount: 2400, sales: 1200 },
  { name: 'روغن زیتون فرادست فری', slug: 'olive-oil-fredo', description: 'روغن زیتون بکر فرادست ۱ لیتری، مناسب سالاد و سرخ کردن', price: 890000, stock: 40, categorySlug: 'supermarket', image: '/images/products/olive-oil.svg', discount: 5, rating: 4.7, ratingCount: 1200, sales: 450 },
  { name: 'چای احمد لاهیجان', slug: 'tea-ahmad', description: 'چای سیاه احمد لاهیجان ۵۰۰ گرم، خالص و خوش‌عطر', price: 420000, stock: 60, categorySlug: 'supermarket', image: '/images/products/tea.svg', discount: 0, rating: 4.6, ratingCount: 1800, sales: 900 },
  { name: 'قهوه اسپرسو دمبرگ', slug: 'coffee-amber', description: 'قهوه اسپرسو دمبرگ ۲۵۰ گرم، برشته تیره', price: 750000, stock: 30, categorySlug: 'supermarket', image: '/images/products/coffee.svg', discount: 12, rating: 4.8, ratingCount: 950, sales: 380 },
  { name: 'شیر کم چرب دامداران', slug: 'milk-damdaran', description: 'شیر کم چرب دامداران ۱ لیتر، پاستوریزه', price: 35000, stock: 200, categorySlug: 'supermarket', image: '/images/products/milk.svg', discount: 0, rating: 4.4, ratingCount: 3100, sales: 2100 },
  { name: 'شکلات تلخ ۷۵٪ بلغور', slug: 'chocolate-bulghur', description: 'شکلات تلخ ۷۵٪ بلغور ۱۰۰ گرمی', price: 98000, stock: 80, categorySlug: 'supermarket', image: '/images/products/chocolate.svg', discount: 15, rating: 4.6, ratingCount: 850, sales: 620 },
  // لباس و مد
  { name: 'تی‌شرت پنبه آدیداس', slug: 'tshirt-adidas', description: 'تی‌شرت پنبه‌ای آدیداس، سایز S تا XXL', price: 680000, stock: 25, categorySlug: 'fashion', image: '/images/products/tshirt.svg', discount: 10, rating: 4.3, ratingCount: 320, sales: 145 },
  { name: 'شلوار جین لی', slug: 'jeans-lee', description: 'شلوار جین اسکینی لی، با الیاف کشدار', price: 1450000, stock: 18, categorySlug: 'fashion', image: '/images/products/jeans.svg', discount: 8, rating: 4.4, ratingCount: 280, sales: 110 },
  { name: 'کفش ورزشی نایک ایر', slug: 'shoes-nike-air', description: 'کفش ورزشی نایک ایر مکس، سایز ۴۰ تا ۴۵', price: 5200000, stock: 12, categorySlug: 'fashion', image: '/images/products/shoes.svg', discount: 15, rating: 4.7, ratingCount: 540, sales: 230 },
  { name: 'پالتو مردانه زمستانی', slug: 'jacket-winter', description: 'پالتو مردانه ضخیم با آستر پشمی، رنگ مشکی', price: 3800000, stock: 8, categorySlug: 'fashion', image: '/images/products/jacket.svg', discount: 0, rating: 4.5, ratingCount: 120, sales: 45 },
  { name: 'ساعت مچی کاسیو کلاسیک', slug: 'watch-casio', description: 'ساعت مچی کاسیو کلاسیک با بند چرم، ضدآب', price: 2800000, stock: 15, categorySlug: 'fashion', image: '/images/products/watch-classic.svg', discount: 12, rating: 4.6, ratingCount: 480, sales: 190 },
  // ابزارآلات
  { name: 'دریل شارژی بوش', slug: 'drill-bosch', description: 'دریل شارژی بوش ۱۸ ولت با دو باتری و کیف', price: 8900000, stock: 10, categorySlug: 'tools', image: '/images/products/drill.svg', discount: 10, rating: 4.8, ratingCount: 260, sales: 95 },
  { name: 'ست آچار یکسر ترک', slug: 'wrench-set', description: 'ست آچار یکسر ۱۲ عددی ترک، سایز ۶ تا ۲۴', price: 1900000, stock: 20, categorySlug: 'tools', image: '/images/products/screwdriver-set.svg', discount: 0, rating: 4.5, ratingCount: 180, sales: 75 },
  { name: 'نردبان آلومینیومی تاشو', slug: 'ladder-folding', description: 'نردبان آلومینیومی ۶ پله تاشو با تحمل ۱۵۰ کیلوگرم', price: 3200000, stock: 8, categorySlug: 'tools', image: '/images/products/ladder.svg', discount: 5, rating: 4.6, ratingCount: 90, sales: 32 },
  { name: 'چکش خیاطی ویلار', slug: 'hammer-villar', description: 'چکش دسته فایبرگلاس ویلار، وزن ۸۰۰ گرم', price: 750000, stock: 30, categorySlug: 'tools', image: '/images/products/hammer.svg', discount: 0, rating: 4.3, ratingCount: 140, sales: 60 },
  { name: 'جعبه ابزار ۹۰ عددی', slug: 'toolbox-90', description: 'جعبه ابزار کامل ۹۰ قطعه‌ای مناسب منزل و کارگاه', price: 2800000, stock: 12, categorySlug: 'tools', image: '/images/products/toolbox.svg', discount: 8, rating: 4.7, ratingCount: 210, sales: 85 },
  // کارت گرافیک
  { name: 'کارت گرافیک RTX 4070', slug: 'rtx-4070', description: 'کارت گرافیک RTX 4070 12GB گیگابایت، مناسب گیمینگ و رندرینگ 4K', price: 48000000, stock: 6, categorySlug: 'gpu', image: '/images/products/rtx4070.svg', discount: 5, rating: 4.9, ratingCount: 150, sales: 38 },
  { name: 'کارت گرافیک RX 580 8GB', slug: 'rx-580', description: 'کارت گرافیک RX 580 8GB سافایر، اقتصادی و محبوب گیمرها', price: 12500000, stock: 15, categorySlug: 'gpu', image: '/images/products/rx580.svg', discount: 12, rating: 4.5, ratingCount: 620, sales: 280 },
  { name: 'کارت گرافیک RTX 4060', slug: 'rtx-4060', description: 'کارت گرافیک RTX 4060 8GB ایسوس، با DLSS 3', price: 26000000, stock: 10, categorySlug: 'gpu', image: '/images/products/rtx4060.svg', discount: 0, rating: 4.7, ratingCount: 220, sales: 75 },
  { name: 'کارت گرافیک RX 6700 XT', slug: 'rx-6700xt', description: 'کارت گرافیک RX 6700 XT 12GB سافایر، قدرت بالا برای 1440p', price: 21000000, stock: 8, categorySlug: 'gpu', image: '/images/products/rx6700xt.svg', discount: 10, rating: 4.6, ratingCount: 190, sales: 55 },
  { name: 'کارت گرافیک GTX 1660 Super', slug: 'gtx-1660-super', description: 'کارت گرافیک GTX 1660 Super 6GB گیگابایت، مقرون‌به‌صرفه', price: 9800000, stock: 12, categorySlug: 'gpu', image: '/images/products/gtx1660.svg', discount: 15, rating: 4.4, ratingCount: 410, sales: 165 },
]

const newVendors: SeedVendor[] = [
  // طلا و نقره
  { productSlug: 'gold-coin', name: 'زرین‌بار برج میلاد', city: 'تهران', address: 'تهران، برج میلاد، طبقه ۲، واحد طلا', phone: '۰۲۱-۲۱۰۰۱۰۰۱', rating: 4.8, price: 245000000, stock: 3 },
  { productSlug: 'gold-coin', name: 'تضامنی نقره‌چی اصفهان', city: 'اصفهان', address: 'اصفهان، چهارباغ بالا، بازار طلافروشان', phone: '۰۳۱-۳۴۵۰۰۱۲', rating: 4.6, price: 244500000, stock: 2 },
  { productSlug: 'gold-bar-1g', name: 'گنجینه مشهد', city: 'مشهد', address: 'مشهد، خیابان امام رضا، پاساژ طلا', phone: '۰۵۱-۳۷۵۰۰۳۴', rating: 4.7, price: 9300000, stock: 5 },
  { productSlug: 'gold-bar-1g', name: 'زرین‌بار برج میلاد', city: 'تهران', address: 'تهران، برج میلاد، طبقه ۲، واحد طلا', phone: '۰۲۱-۲۱۰۰۱۰۰۱', rating: 4.8, price: 9200000, stock: 4 },
  { productSlug: 'gold-ring', name: 'تضامنی نقره‌چی اصفهان', city: 'اصفهان', address: 'اصفهان، چهارباغ بالا، بازار طلافروشان', phone: '۰۳۱-۳۴۵۰۰۱۲', rating: 4.6, price: 14700000, stock: 2 },
  { productSlug: 'silver-chain', name: 'نقره‌ستان شیراز', city: 'شیراز', address: 'شیراز، خیابان زند، بازار وکیل', phone: '۰۷۱-۳۶۶۰۰۴۵', rating: 4.5, price: 3300000, stock: 6 },
  // سوپرمارکت
  { productSlug: 'pasta-italyana', name: 'مارکت ارگانیک کرج', city: 'کرج', address: 'کرج، عظیمیه، خیابان اصلی', phone: '۰۲۶-۳۴۴۰۰۵۶', rating: 4.4, price: 79000, stock: 30 },
  { productSlug: 'olive-oil-fredo', name: 'فروشگاه مواد غذایی زیتون', city: 'رشت', address: 'رشت، بلوار معلم، جنب پارک', phone: '۰۱۳-۳۳۵۰۶۷', rating: 4.6, price: 895000, stock: 12 },
  { productSlug: 'coffee-amber', name: 'کافه و قهوه بون', city: 'تبریز', address: 'تبریز، خیابان امام، کوچه بازار', phone: '۰۴۱-۳۳۵۶۰۸', rating: 4.7, price: 760000, stock: 8 },
  // لباس
  { productSlug: 'shoes-nike-air', name: 'بوتیک استایل مدرن', city: 'تهران', address: 'تهران، خیابان ولیعصر، مجتمع تجاری', phone: '۰۲۱-۸۸۷۷۰۱۲', rating: 4.7, price: 5300000, stock: 4 },
  { productSlug: 'tshirt-adidas', name: 'پوشاک اسپرت مهر', city: 'مشهد', address: 'مشهد، بلوار وکیل‌آباد', phone: '۰۵۱-۳۸۸۵۰۴۵', rating: 4.3, price: 690000, stock: 10 },
  // ابزار
  { productSlug: 'drill-bosch', name: 'ابزارفروشی صنعت‌کار', city: 'تهران', address: 'تهران، خیابان جمهوری، پاساژ ابزار', phone: '۰۲۱-۶۶۷۲۰۳۴', rating: 4.8, price: 8950000, stock: 3 },
  { productSlug: 'toolbox-90', name: 'ابزار مرکزی اهواز', city: 'اهواز', address: 'اهواز، خیابان نادری', phone: '۰۶۱-۳۳۶۵۰۹', rating: 4.5, price: 2850000, stock: 5 },
  // کارت گرافیک
  { productSlug: 'rx-580', name: 'فروشگاه کامپیوتر آرین', city: 'تهران', address: 'تهران، خیابان ولیعصر، فروشگاه آرین', phone: '۰۲۱-۸۸۷۵۴۰۱', rating: 4.6, price: 12800000, stock: 4 },
  { productSlug: 'rx-580', name: 'دیجی‌لند اصفهان', city: 'اصفهان', address: 'اصفهان، خیابان حکیم‌نظامی', phone: '۰۳۱-۳۶۵۰۰۲', rating: 4.4, price: 12500000, stock: 6 },
  { productSlug: 'rx-580', name: 'رایان پویا تبریز', city: 'تبریز', address: 'تبریز، خیابان تربیت', phone: '۰۴۱-۳۵۵۰۸۷', rating: 4.3, price: 12650000, stock: 3 },
  { productSlug: 'rtx-4070', name: 'فروشگاه کامپیوتر آرین', city: 'تهران', address: 'تهران، خیابان ولیعصر، فروشگاه آرین', phone: '۰۲۱-۸۸۷۵۴۰۱', rating: 4.6, price: 48500000, stock: 2 },
  { productSlug: 'rtx-4070', name: 'گیم‌لند شیراز', city: 'شیراز', address: 'شیراز، معالی‌آباد', phone: '۰۷۱-۳۷۵۰۲۳', rating: 4.7, price: 48000000, stock: 2 },
  { productSlug: 'rtx-4060', name: 'فروشگاه کامپیوتر آرین', city: 'تهران', address: 'تهران، خیابان ولیعصر، فروشگاه آرین', phone: '۰۲۱-۸۸۷۵۴۰۱', rating: 4.6, price: 26500000, stock: 3 },
  { productSlug: 'gtx-1660-super', name: 'رایان پویا تبریز', city: 'تبریز', address: 'تبریز، خیابان تربیت', phone: '۰۴۱-۳۵۵۰۸۷', rating: 4.3, price: 9900000, stock: 5 },
  { productSlug: 'gtx-1660-super', name: 'دیجی‌لند اصفهان', city: 'اصفهان', address: 'اصفهان، خیابان حکیم‌نظامی', phone: '۰۳۱-۳۶۵۰۰۲', rating: 4.4, price: 9850000, stock: 4 },
  { productSlug: 'rx-6700xt', name: 'گیم‌لند شیراز', city: 'شیراز', address: 'شیراز، معالی‌آباد', phone: '۰۷۱-۳۷۵۰۲۳', rating: 4.7, price: 21200000, stock: 2 },
]

async function main() {
  // create new categories
  const catIds = new Map<string, number>()
  for (const cat of newCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    })
    catIds.set(cat.slug, created.id)
  }

  // create new products
  for (const p of newProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.image,
        discountPercent: p.discount,
        rating: p.rating,
        ratingCount: p.ratingCount,
        salesCount: p.sales,
        categoryId: catIds.get(p.categorySlug)!,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.image,
        discountPercent: p.discount,
        rating: p.rating,
        ratingCount: p.ratingCount,
        salesCount: p.sales,
        categoryId: catIds.get(p.categorySlug)!,
      },
    })
  }

  // add vendors (clear old ones first so re-running the build doesn't duplicate them)
  await prisma.vendor.deleteMany({})
  let vendorCount = 0
  for (const v of newVendors) {
    const product = await prisma.product.findUnique({ where: { slug: v.productSlug } })
    if (!product) continue
    await prisma.vendor.create({
      data: {
        productId: product.id,
        name: v.name,
        city: v.city,
        address: v.address,
        phone: v.phone,
        rating: v.rating,
        price: v.price,
        stock: v.stock,
      },
    })
    vendorCount++
  }

  const totalProducts = await prisma.product.count()
  console.log(`Seed more ✅ (${newCategories.length} new categories, ${newProducts.length} new products, ${vendorCount} vendors; total products: ${totalProducts})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

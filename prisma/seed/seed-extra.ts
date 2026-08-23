import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedCategory = { name: string; slug: string; icon: string };
type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categorySlug: string;
  image: string;
  discount: number;
  rating: number;
  ratingCount: number;
  sales: number;
};
type SeedVendor = {
  productSlug: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
  price: number;
  stock: number;
};
type SeedReview = {
  productSlug: string;
  author: string;
  date: string;
  rating: number;
  title: string;
  text: string;
  verified: boolean;
};

const newCategories: SeedCategory[] = [
  { name: "لوازم خانه و آشپزخانه", slug: "home-kitchen", icon: "🏠" },
  { name: "لوازم جانبی کامپیوتر", slug: "computer-accessories", icon: "🖱️" },
  { name: "آرایشی و بهداشتی", slug: "beauty-health", icon: "💄" },
];

const newProducts: SeedProduct[] = [
  // لوازم خانه و آشپزخانه
  {
    name: "سرخ‌کن بدون روغن فیلیپس",
    slug: "air-fryer-philips",
    description:
      "سرخ‌کن بدون روغن فیلیپس ظرفیت ۴.۲ لیتر، با فناوری Rapid Air و پنل دیجیتال",
    price: 8900000,
    stock: 14,
    categorySlug: "home-kitchen",
    image: "/images/products/air-fryer.svg",
    discount: 12,
    rating: 4.7,
    ratingCount: 640,
    sales: 310,
  },
  {
    name: "اتوی بخار پارس خزر",
    slug: "iron-pars-khazar",
    description: "اتوی بخار پارس خزر با کف تفلون و مخزن آب ۳۰۰ میلی‌لیتری",
    price: 1250000,
    stock: 25,
    categorySlug: "home-kitchen",
    image: "/images/products/iron.svg",
    discount: 5,
    rating: 4.3,
    ratingCount: 210,
    sales: 145,
  },
  {
    name: "قهوه‌ساز دلونگی",
    slug: "coffee-maker-delonghi",
    description: "قهوه‌ساز دلونگی مدل اسپرسو با فشار ۱۵ بار و کف‌ساز شیر",
    price: 6400000,
    stock: 10,
    categorySlug: "home-kitchen",
    image: "/images/products/coffee-maker.svg",
    discount: 0,
    rating: 4.8,
    ratingCount: 380,
    sales: 120,
  },
  {
    name: "مخلوط‌کن پاناسونیک",
    slug: "blender-panasonic",
    description: "مخلوط‌کن پاناسونیک ۶۰۰ وات با پارچ شیشه‌ای ۱.۵ لیتری",
    price: 2100000,
    stock: 18,
    categorySlug: "home-kitchen",
    image: "/images/products/blender.svg",
    discount: 8,
    rating: 4.4,
    ratingCount: 290,
    sales: 175,
  },
  {
    name: "جاروبرقی بدون سیم دایسون",
    slug: "vacuum-dyson",
    description:
      "جاروبرقی بدون سیم دایسون V8 با قدرت مکش بالا و باتری قابل شارژ",
    price: 24500000,
    stock: 6,
    categorySlug: "home-kitchen",
    image: "/images/products/vacuum.svg",
    discount: 10,
    rating: 4.9,
    ratingCount: 520,
    sales: 95,
  },
  // لوازم جانبی کامپیوتر
  {
    name: "ماوس گیمینگ لاجیتک G502",
    slug: "mouse-logitech-g502",
    description:
      "ماوس گیمینگ لاجیتک G502 با سنسور HERO 25K و ۱۱ دکمه قابل برنامه‌ریزی",
    price: 2450000,
    stock: 30,
    categorySlug: "computer-accessories",
    image: "/images/products/mouse-g502.svg",
    discount: 15,
    rating: 4.8,
    ratingCount: 920,
    sales: 540,
  },
  {
    name: "کیبورد مکانیکی ردراگون",
    slug: "keyboard-redragon",
    description: "کیبورد مکانیکی ردراگون با سوییچ بلو و نورپردازی RGB",
    price: 1850000,
    stock: 22,
    categorySlug: "computer-accessories",
    image: "/images/products/keyboard-redragon.svg",
    discount: 10,
    rating: 4.5,
    ratingCount: 610,
    sales: 380,
  },
  {
    name: "هدست گیمینگ HyperX",
    slug: "headset-hyperx",
    description:
      "هدست گیمینگ HyperX Cloud II با صدای سراند ۷.۱ و میکروفون حذف نویز",
    price: 3600000,
    stock: 16,
    categorySlug: "computer-accessories",
    image: "/images/products/headset-hyperx.svg",
    discount: 5,
    rating: 4.7,
    ratingCount: 450,
    sales: 260,
  },
  {
    name: "ماوس‌پد ایکس‌ال ریزر",
    slug: "mousepad-razer-xl",
    description: "ماوس‌پد ایکس‌ال ریزر با سطح بافته‌شده و پایه ضدلغزش",
    price: 890000,
    stock: 40,
    categorySlug: "computer-accessories",
    image: "/images/products/mousepad-razer.svg",
    discount: 0,
    rating: 4.6,
    ratingCount: 340,
    sales: 410,
  },
  {
    name: "وب‌کم لاجیتک C920",
    slug: "webcam-logitech-c920",
    description: "وب‌کم لاجیتک C920 با کیفیت فول‌اچ‌دی ۱۰۸۰p و میکروفون استریو",
    price: 3200000,
    stock: 12,
    categorySlug: "computer-accessories",
    image: "/images/products/webcam-c920.svg",
    discount: 8,
    rating: 4.6,
    ratingCount: 280,
    sales: 165,
  },
  // آرایشی و بهداشتی
  {
    name: "کرم ضدآفتاب لافارر",
    slug: "sunscreen-lafarr",
    description: "کرم ضدآفتاب لافارر SPF50 مناسب پوست چرب و مختلط، بدون چربی",
    price: 480000,
    stock: 55,
    categorySlug: "beauty-health",
    image: "/images/products/sunscreen.svg",
    discount: 10,
    rating: 4.5,
    ratingCount: 780,
    sales: 690,
  },
  {
    name: "شامپو ضدریزش سه‌ویو",
    slug: "shampoo-seviv",
    description:
      "شامپو ضدریزش سه‌ویو حاوی بیوتین و کافئین، مناسب موهای آسیب‌دیده",
    price: 320000,
    stock: 65,
    categorySlug: "beauty-health",
    image: "/images/products/shampoo.svg",
    discount: 5,
    rating: 4.3,
    ratingCount: 560,
    sales: 520,
  },
  {
    name: "عطر مردانه مون پاریس",
    slug: "perfume-mont-paris",
    description:
      "ادکلن مردانه مون پاریس، رایحه چوبی-ادویه‌ای، حجم ۱۰۰ میلی‌لیتر",
    price: 1950000,
    stock: 20,
    categorySlug: "beauty-health",
    image: "/images/products/perfume.svg",
    discount: 12,
    rating: 4.7,
    ratingCount: 410,
    sales: 230,
  },
  {
    name: "ست مسواک برقی اورال-بی",
    slug: "toothbrush-oralb",
    description: "مسواک برقی اورال-بی با ۳ سری برس یدکی و تایمر هوشمند",
    price: 2300000,
    stock: 18,
    categorySlug: "beauty-health",
    image: "/images/products/toothbrush.svg",
    discount: 0,
    rating: 4.6,
    ratingCount: 330,
    sales: 190,
  },
  {
    name: "ریش‌تراش فیلیپس",
    slug: "shaver-philips",
    description:
      "ریش‌تراش فیلیپس شارژی با تیغه ضدحساسیت و قابلیت استفاده در حمام",
    price: 2750000,
    stock: 15,
    categorySlug: "beauty-health",
    image: "/images/products/shaver.svg",
    discount: 8,
    rating: 4.5,
    ratingCount: 260,
    sales: 145,
  },
];

const newVendors: SeedVendor[] = [
  {
    productSlug: "air-fryer-philips",
    name: "فروشگاه لوازم خانگی امید",
    city: "تهران",
    address: "تهران، خیابان جمهوری، پاساژ لوازم خانگی",
    phone: "۰۲۱-۶۶۵۵۰۱۲",
    rating: 4.6,
    price: 8950000,
    stock: 5,
  },
  {
    productSlug: "air-fryer-philips",
    name: "دیجی‌لند اصفهان",
    city: "اصفهان",
    address: "اصفهان، خیابان حکیم‌نظامی",
    phone: "۰۳۱-۳۶۵۰۰۲",
    rating: 4.4,
    price: 8850000,
    stock: 4,
  },
  {
    productSlug: "coffee-maker-delonghi",
    name: "کافه‌شاپ تجهیزات مشهد",
    city: "مشهد",
    address: "مشهد، بلوار وکیل‌آباد",
    phone: "۰۵۱-۳۸۸۵۰۴۵",
    rating: 4.8,
    price: 6450000,
    stock: 3,
  },
  {
    productSlug: "vacuum-dyson",
    name: "فروشگاه لوازم خانگی امید",
    city: "تهران",
    address: "تهران، خیابان جمهوری، پاساژ لوازم خانگی",
    phone: "۰۲۱-۶۶۵۵۰۱۲",
    rating: 4.6,
    price: 24800000,
    stock: 2,
  },
  {
    productSlug: "mouse-logitech-g502",
    name: "فروشگاه کامپیوتر آرین",
    city: "تهران",
    address: "تهران، خیابان ولیعصر، فروشگاه آرین",
    phone: "۰۲۱-۸۸۷۵۴۰۱",
    rating: 4.6,
    price: 2480000,
    stock: 8,
  },
  {
    productSlug: "mouse-logitech-g502",
    name: "رایان پویا تبریز",
    city: "تبریز",
    address: "تبریز، خیابان تربیت",
    phone: "۰۴۱-۳۵۵۰۸۷",
    rating: 4.3,
    price: 2420000,
    stock: 6,
  },
  {
    productSlug: "keyboard-redragon",
    name: "گیم‌لند شیراز",
    city: "شیراز",
    address: "شیراز، معالی‌آباد",
    phone: "۰۷۱-۳۷۵۰۲۳",
    rating: 4.7,
    price: 1830000,
    stock: 10,
  },
  {
    productSlug: "headset-hyperx",
    name: "فروشگاه کامپیوتر آرین",
    city: "تهران",
    address: "تهران، خیابان ولیعصر، فروشگاه آرین",
    phone: "۰۲۱-۸۸۷۵۴۰۱",
    rating: 4.6,
    price: 3650000,
    stock: 4,
  },
  {
    productSlug: "sunscreen-lafarr",
    name: "داروخانه دکتر محمدی",
    city: "تهران",
    address: "تهران، خیابان انقلاب، جنب داروخانه",
    phone: "۰۲۱-۶۶۰۰۱۲۳",
    rating: 4.5,
    price: 490000,
    stock: 20,
  },
  {
    productSlug: "perfume-mont-paris",
    name: "عطرفروشی گلستان",
    city: "اصفهان",
    address: "اصفهان، چهارباغ بالا",
    phone: "۰۳۱-۳۴۵۰۰۱۲",
    rating: 4.7,
    price: 1980000,
    stock: 7,
  },
  {
    productSlug: "shaver-philips",
    name: "فروشگاه لوازم خانگی امید",
    city: "تهران",
    address: "تهران، خیابان جمهوری، پاساژ لوازم خانگی",
    phone: "۰۲۱-۶۶۵۵۰۱۲",
    rating: 4.6,
    price: 2790000,
    stock: 6,
  },
];

const newReviews: SeedReview[] = [
  {
    productSlug: "air-fryer-philips",
    author: "محمد رضایی",
    date: "۱۴۰۳/۰۴/۱۸",
    rating: 5,
    title: "خیلی راضی‌ام",
    text: "کیفیت پخت عالیه و تمیز کردنش خیلی راحته. پیشنهاد می‌کنم.",
    verified: true,
  },
  {
    productSlug: "air-fryer-philips",
    author: "سارا احمدی",
    date: "۱۴۰۳/۰۳/۲۵",
    rating: 4,
    title: "خوبه ولی صداش زیاده",
    text: "کیفیت غذا عالیه ولی موقع کار کردن یکم صدا داره.",
    verified: true,
  },
  {
    productSlug: "coffee-maker-delonghi",
    author: "علی کریمی",
    date: "۱۴۰۳/۰۴/۰۲",
    rating: 5,
    title: "قهوه‌ی حرفه‌ای",
    text: "طعم اسپرسوش دقیقا مثل کافی‌شاپه. کف‌ساز شیرش هم عالیه.",
    verified: true,
  },
  {
    productSlug: "vacuum-dyson",
    author: "نگار حسینی",
    date: "۱۴۰۳/۰۴/۱۰",
    rating: 5,
    title: "ارزش خریدش رو داره",
    text: "قدرت مکش فوق‌العاده‌ست، فقط قیمتش یکم بالاست.",
    verified: true,
  },
  {
    productSlug: "vacuum-dyson",
    author: "امیر توکلی",
    date: "۱۴۰۳/۰۳/۳۰",
    rating: 4,
    title: "باتری زود تموم میشه",
    text: "در حالت قدرت بالا باتریش حدود ۱۵ دقیقه دووم میاره.",
    verified: false,
  },
  {
    productSlug: "mouse-logitech-g502",
    author: "حسین مرادی",
    date: "۱۴۰۳/۰۴/۱۵",
    rating: 5,
    title: "بهترین ماوس گیمینگ",
    text: "دقت سنسورش فوق‌العاده‌ست، برای گیمینگ حرفه‌ای پیشنهاد میشه.",
    verified: true,
  },
  {
    productSlug: "mouse-logitech-g502",
    author: "زهرا نوری",
    date: "۱۴۰۳/۰۳/۲۰",
    rating: 5,
    title: "راحت و باکیفیت",
    text: "دستم بعد از چند ساعت کار هم خسته نمیشه، ارگونومیش خیلی خوبه.",
    verified: true,
  },
  {
    productSlug: "keyboard-redragon",
    author: "رضا صادقی",
    date: "۱۴۰۳/۰۴/۰۵",
    rating: 4,
    title: "صدای کلیک زیاده",
    text: "کیفیت ساخت خوبه ولی سوییچ بلو صدای زیادی داره.",
    verified: true,
  },
  {
    productSlug: "headset-hyperx",
    author: "مریم قاسمی",
    date: "۱۴۰۳/۰۴/۱۲",
    rating: 5,
    title: "صدای فوق‌العاده",
    text: "کیفیت صدا و میکروفونش عالیه، برای پخش استریم هم مناسبه.",
    verified: true,
  },
  {
    productSlug: "sunscreen-lafarr",
    author: "الهام رستمی",
    date: "۱۴۰۳/۰۴/۰۸",
    rating: 4,
    title: "خوب جذب میشه",
    text: "روی پوست چربم زیاد چرب نمیشه، فقط بوش یکم زیاده.",
    verified: true,
  },
  {
    productSlug: "perfume-mont-paris",
    author: "کیوان امینی",
    date: "۱۴۰۳/۰۳/۲۸",
    rating: 5,
    title: "رایحه ماندگار",
    text: "تا آخر شب روی لباس می‌مونه، خیلی خوشبو و خاصه.",
    verified: true,
  },
  {
    productSlug: "shaver-philips",
    author: "بهنام یوسفی",
    date: "۱۴۰۳/۰۴/۲۰",
    rating: 4,
    title: "تیغه خوب و بی‌درد",
    text: "برای پوست حساس مناسبه، فقط شارژش کند هست.",
    verified: true,
  },
];

async function main() {
  // create new categories
  const catIds = new Map<string, number>();
  for (const cat of newCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    catIds.set(cat.slug, created.id);
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
    });
  }

  // add vendors
  let vendorCount = 0;
  for (const v of newVendors) {
    const product = await prisma.product.findUnique({
      where: { slug: v.productSlug },
    });
    if (!product) continue;
    const existing = await prisma.vendor.findFirst({
      where: { productId: product.id, name: v.name },
    });
    if (existing) continue;
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
    });
    vendorCount++;
  }

  // add reviews
  let reviewCount = 0;
  for (const r of newReviews) {
    const product = await prisma.product.findUnique({
      where: { slug: r.productSlug },
    });
    if (!product) continue;
    const existing = await prisma.review.findFirst({
      where: { productId: product.id, author: r.author, title: r.title },
    });
    if (existing) continue;
    await prisma.review.create({
      data: {
        productId: product.id,
        author: r.author,
        date: r.date,
          rating: r.rating,
          title: r.title,
          text: r.text,
          verified: r.verified,
          approved: true,
        },
      });
    reviewCount++;
  }

  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalReviews = await prisma.review.count();
  console.log(
    `Seed extra ✅ (${newCategories.length} new categories, ${newProducts.length} new products, ${vendorCount} vendors, ${reviewCount} reviews; totals -> categories: ${totalCategories}, products: ${totalProducts}, reviews: ${totalReviews})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

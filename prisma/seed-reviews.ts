import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type ReviewSeed = {
  author: string;
  rating: number;
  title: string;
  text: string;
  verified: boolean;
};

// 2-3 reviews per product, generic enough to fit any product
const REVIEW_TEMPLATES: ReviewSeed[] = [
  {
    author: "علی محمدی",
    rating: 5,
    title: "کیفیت عالی، ارسال سریع",
    text: "دقیقاً مطابق توضیحات بود. بسته‌بندی بسیار خوب و ارسال هم خیلی سریع انجام شد. از خریدم کاملاً راضی هستم.",
    verified: true,
  },
  {
    author: "مریم رضایی",
    rating: 4,
    title: "محصول خوب با یک نکته",
    text: "محصول از نظر کیفیت عالیه و قیمتش منصفانه. فقط کاش باطری کمی بیشتر دوام می‌آورد. در کل ارزش خرید دارد.",
    verified: true,
  },
  {
    author: "حسین کریمی",
    rating: 5,
    title: "پیشنهاد می‌کنم",
    text: "بعد از تحقیق زیاد بین چند گزینه، این محصول رو انتخاب کردم. بهترین تصمیم بود. ضمانت اصالت کالا هم خیالم رو راحت کرد.",
    verified: true,
  },
  {
    author: "سارا احمدی",
    rating: 5,
    title: "راضیم خریدم",
    text: "برای استفاده روزانه عالیه. کارایی‌اش دقیقاً همون چیزیه که انتظار داشتم. ارسال درب منزل هم فوق‌العاده بود.",
    verified: true,
  },
  {
    author: "امیر حسینی",
    rating: 3,
    title: "خوب ولی جا برای بهبود",
    text: "از نظر عملکرد مشکلی نداره ولی نسبت به قیمتش انتظار بیشتری داشتم. اگه تخفیف داشته باشه ارزش خرید داره.",
    verified: false,
  },
  {
    author: "نگار موسوی",
    rating: 5,
    title: "دقیقاً همون چیزیه که می‌خواستم",
    text: "برای مدت زیادی تحقیق کردم و بالاخره این رو خریدم. از کیفیت ساخت و عملکردش واقعاً راضی‌ام.",
    verified: true,
  },
];

async function main() {
  const products = await prisma.product.findMany({ select: { id: true } });

  // clear existing reviews to make seeding idempotent per product
  await prisma.review.deleteMany({});

  let count = 0;
  for (const product of products) {
    // deterministic per-product pick: 2-3 reviews with offset
    const offset = product.id % REVIEW_TEMPLATES.length;
    const n = 2 + (product.id % 2); // 2 or 3 reviews per product
    for (let i = 0; i < n; i++) {
      const t = REVIEW_TEMPLATES[(offset + i) % REVIEW_TEMPLATES.length];
      await prisma.review.create({
        data: {
          productId: product.id,
          author: t.author,
          date: `${1403 - (i % 2)}/${String(1 + (product.id % 12)).padStart(2, "0")}/${String(1 + i * 7).padStart(2, "0")}`,
          rating: t.rating,
          title: t.title,
          text: t.text,
          verified: t.verified,
        },
      });
      count++;
    }
  }

  console.log(
    `Reviews seeded ✅ (${count} reviews for ${products.length} products)`,
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

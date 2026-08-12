import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSyncSecret } from "@/lib/sync-secret";

const CITIES = ['تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'رشت']
const SHOPS = ['فروشگاه دیجی‌تک', 'مارکت آنلاین پارس', 'فروشگاه تکنو', 'شاپ آنلاین مهر', 'بوتیک استور', 'فروشگاه مدرن', 'هایپرمارکت دیجیتال', 'فروشگاه اینترنتی آریا']
const REVIEWS = [
  { author: 'فرزاد محمدی', rating: 5, title: 'عالی بود', text: 'کیفیت عالی و ارسال سریع. کاملاً راضی هستم.', verified: true },
  { author: 'شیرین افشار', rating: 3, title: 'متوسط', text: 'قابل قبول بود ولی انتظار بیشتری داشتم.', verified: true },
  { author: 'آرش رضایی', rating: 4, title: 'خوب', text: 'محصول خوبیه، فقط کاش بسته‌بندی بهتری داشت.', verified: false },
  { author: 'نازنین کریمی', rating: 5, title: 'عالی', text: 'دقیقاً همون چیزی بود که می‌خواستم.', verified: true },
]

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!isSyncSecret(secret)) {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({ select: { id: true, price: true } });
    let vendorCount = 0;
    let reviewCount = 0;

    for (const product of products) {
      // فروشنده اگر ندارد
      const hasVendor = await prisma.vendor.findFirst({ where: { productId: product.id } });
      if (!hasVendor) {
        const n = 1 + (product.id % 2);
        for (let i = 0; i < n; i++) {
          const city = CITIES[(product.id + i) % CITIES.length];
          const shop = SHOPS[(product.id + i) % SHOPS.length];
          const delta = (product.id % 5) - 2;
          const price = Math.round(product.price * (1 + delta / 100));
          await prisma.vendor.create({
            data: {
              productId: product.id,
              name: shop,
              city,
              address: `${city}، خیابان اصلی، پلاک ${10 + (product.id % 90)}`,
              phone: `۰۲۱-${String(10000000 + product.id * 137).slice(0, 8)}`,
              rating: 4 + (product.id % 10) / 10,
              price,
              stock: 1 + (product.id % 15),
            },
          });
          vendorCount++;
        }
      }

      // نظر اگر ندارد
      const reviewCnt = await prisma.review.count({ where: { productId: product.id } });
      if (reviewCnt === 0) {
        const n = 2 + (product.id % 2);
        for (let i = 0; i < n; i++) {
          const r = REVIEWS[(product.id + i) % REVIEWS.length];
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
          });
          reviewCount++;
        }
      }
    }

    const withVendor = await prisma.vendor.groupBy({ by: ['productId'] });
    const withReview = await prisma.review.groupBy({ by: ['productId'] });
    return Response.json({
      success: true,
      message: `extras synced: ${vendorCount} vendors, ${reviewCount} reviews; ${withVendor.length}/${products.length} vendors, ${withReview.length}/${products.length} reviews`,
    });
  } catch (e) {
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
}
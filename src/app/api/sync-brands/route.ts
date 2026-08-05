import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const BRAND_PRODUCTS = [
  { name: 'آیفون 13', slug: 'iphone-13', description: 'آیفون 13 با تراشه A15', price: 29000000, stock: 12, cat: 'mobile', image: '/images/products/iphone-15.svg', discount: 12, rating: 4.5, ratingCount: 500, sales: 220 },
  { name: 'آیفون 14', slug: 'iphone-14', description: 'آیفون 14 با تراشه A15', price: 39000000, stock: 10, cat: 'mobile', image: '/images/products/iphone-15.svg', discount: 8, rating: 4.6, ratingCount: 350, sales: 150 },
  { name: 'هوم‌پاد مینی', slug: 'homepod-mini', description: 'اسپیکر هوشمند اپل', price: 8500000, stock: 6, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 5, rating: 4.6, ratingCount: 55, sales: 18 },
  { name: 'شیائومی بند 8', slug: 'mi-band-8', description: 'دستبند هوشمند شیائومی', price: 1200000, stock: 25, cat: 'smartwatch', image: '/images/products/galaxy-watch.svg', discount: 5, rating: 4.5, ratingCount: 300, sales: 150 },
  { name: 'هدفون شیائومی', slug: 'xiaomi-earbuds', description: 'هدفون بی‌سیم شیائومی', price: 1800000, stock: 22, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 8, rating: 4.3, ratingCount: 150, sales: 70 },
  { name: 'کنسول PS5 دیجیتال', slug: 'ps5-digital', description: 'پلی‌استیشن 5 دیجیتال', price: 36000000, stock: 5, cat: 'gpu', image: '/images/products/rtx4070.svg', discount: 0, rating: 4.8, ratingCount: 200, sales: 60 },
  { name: 'دوربین سونی A7', slug: 'sony-a7', description: 'دوربین بدون آینه سونی', price: 85000000, stock: 3, cat: 'audio', image: '/images/products/tv-samsung-55.svg', discount: 0, rating: 4.9, ratingCount: 40, sales: 8 },
  { name: 'کفش آدیداس اولترابوست', slug: 'adidas-ultraboost', description: 'کفش آدیداس اولترابوست', price: 6800000, stock: 8, cat: 'fashion', image: '/images/products/shoes.svg', discount: 10, rating: 4.7, ratingCount: 160, sales: 65 },
  { name: 'کفش آدیداس گزل', slug: 'adidas-gazelle', description: 'کفش کلاسیک آدیداس', price: 4800000, stock: 10, cat: 'fashion', image: '/images/products/shoes.svg', discount: 6, rating: 4.5, ratingCount: 120, sales: 50 },
  { name: 'اسپیکر JBL Charge 5', slug: 'jbl-charge-5', description: 'اسپیکر JBL Charge 5', price: 6800000, stock: 10, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 8, rating: 4.7, ratingCount: 180, sales: 75 },
  { name: 'هدفون JBL Live 660', slug: 'jbl-live-660', description: 'هدفون JBL Live 660', price: 4800000, stock: 12, cat: 'audio', image: '/images/products/airpods-pro.svg', discount: 6, rating: 4.5, ratingCount: 130, sales: 55 },
  { name: 'اسپیکر JBL Clip 4', slug: 'jbl-clip-4', description: 'اسپیکر کلیپی JBL Clip 4', price: 2200000, stock: 20, cat: 'audio', image: '/images/products/jbl-flip6.svg', discount: 0, rating: 4.4, ratingCount: 200, sales: 95 },
  { name: 'دریل بوش 750', slug: 'bosch-drill-750', description: 'دریل چکشی بوش', price: 6500000, stock: 10, cat: 'tools', image: '/images/products/drill.svg', discount: 8, rating: 4.7, ratingCount: 120, sales: 45 },
  { name: 'جارو بوش', slug: 'bosch-vacuum', description: 'جاروبرقی بوش', price: 12000000, stock: 6, cat: 'home-appliances', image: '/images/products/vacuum.svg', discount: 5, rating: 4.6, ratingCount: 60, sales: 20 },
];

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "dk-seed-2026") {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    let count = 0;
    for (const p of BRAND_PRODUCTS) {
      const cat = await prisma.category.findUnique({ where: { slug: p.cat } });
      if (!cat) continue;
      const { cat: _c, image, discount, sales, ...data } = p;
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: cat.id },
        create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: cat.id },
      });
      count++;
    }
    const total = await prisma.product.count();
    return Response.json({ success: true, message: `brand synced: ${count}; total: ${total}` });
  } catch (e) {
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
}

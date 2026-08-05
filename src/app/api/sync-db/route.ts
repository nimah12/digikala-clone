import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Sync DB on cloud (Vercel) — run once after deploy
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "dk-seed-2026") {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    // 1) categories
    const cats = [
      { name: 'لوازم خانگی', slug: 'home-appliances' },
      { name: 'کتاب و لوازم تحریر', slug: 'books' },
      { name: 'عطر و ادکلن', slug: 'perfume' },
      { name: 'اسباب‌بازی', slug: 'toys' },
      { name: 'دکوراتیو', slug: 'decor' },
    ];
    const catIds: Record<string, number> = {};
    for (const c of cats) {
      const created = await prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { name: c.name, slug: c.slug },
      });
      catIds[c.slug] = created.id;
    }

    // 2) products for new categories
    const products = [
      { name: 'قهوه‌ساز دلمونگی', slug: 'coffee-maker-delonghi', description: 'قهوه‌ساز اسپرسو دلمونگی', price: 9800000, stock: 8, cat: 'home-appliances', image: '/images/products/coffee-maker.svg', discount: 8, rating: 4.7, ratingCount: 130, sales: 45 },
      { name: 'سرخ‌کن بدون روغن فیلیپس', slug: 'air-fryer-philips', description: 'سرخ‌کن بدون روغن 4.5 لیتری', price: 12500000, stock: 10, cat: 'home-appliances', image: '/images/products/air-fryer.svg', discount: 12, rating: 4.8, ratingCount: 210, sales: 78 },
      { name: 'اتو بخار تفال', slug: 'steam-iron-tefal', description: 'اتو بخار با کف سرامیکی', price: 3200000, stock: 15, cat: 'home-appliances', image: '/images/products/iron.svg', discount: 5, rating: 4.4, ratingCount: 90, sales: 40 },
      { name: 'کتری برقی پارس‌خزر', slug: 'electric-kettle', description: 'کتری برقی 1.7 لیتری', price: 980000, stock: 25, cat: 'home-appliances', image: '/images/products/kettle.svg', discount: 0, rating: 4.3, ratingCount: 150, sales: 85 },
      { name: 'مایکروویو سامسونگ', slug: 'microwave-samsung', description: 'مایکروویو 32 لیتری با گریل', price: 14500000, stock: 6, cat: 'home-appliances', image: '/images/products/microwave.svg', discount: 10, rating: 4.6, ratingCount: 75, sales: 28 },
      { name: 'رمان صد سال تنهایی', slug: 'book-100-years', description: 'رمان جاودانه مارکز', price: 480000, stock: 40, cat: 'books', image: '/images/products/book-novel.svg', discount: 5, rating: 4.9, ratingCount: 350, sales: 180 },
      { name: 'دیوان حافظ', slug: 'book-hafez', description: 'دیوان حافظ با خط نستعلیق', price: 850000, stock: 30, cat: 'books', image: '/images/products/book-poetry.svg', discount: 0, rating: 4.8, ratingCount: 420, sales: 250 },
      { name: 'هنر شفاف اندیشیدن', slug: 'book-clear-thinking', description: 'کتاب روانشناسی رولف دوبلی', price: 390000, stock: 50, cat: 'books', image: '/images/products/book-selfhelp.svg', discount: 8, rating: 4.6, ratingCount: 280, sales: 160 },
      { name: 'مجموعه داستان کودک', slug: 'book-kids', description: 'مجموعه 10 جلدی داستان', price: 650000, stock: 35, cat: 'books', image: '/images/products/book-child.svg', discount: 10, rating: 4.7, ratingCount: 190, sales: 110 },
      { name: 'آموزش پایتون', slug: 'book-python', description: 'کتاب آموزش پایتون', price: 520000, stock: 45, cat: 'books', image: '/images/products/book-tech.svg', discount: 0, rating: 4.5, ratingCount: 230, sales: 140 },
      { name: 'عطر مردانه عود', slug: 'perfume-oud', description: 'عطر مردانه با رایحه گرم', price: 2800000, stock: 12, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 6, rating: 4.6, ratingCount: 180, sales: 75 },
      { name: 'عطر زنانه گل یاس', slug: 'perfume-jasmine', description: 'عطر زنانه با رایحه یاس', price: 2400000, stock: 14, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 4, rating: 4.5, ratingCount: 160, sales: 65 },
      { name: 'ادکلن یونیسکس', slug: 'perfume-cologne', description: 'ادکلن با رایحه مرکبات', price: 1500000, stock: 20, cat: 'perfume', image: '/images/products/perfume-unisex.svg', discount: 0, rating: 4.3, ratingCount: 120, sales: 55 },
      { name: 'لگو شهر 800 قطعه', slug: 'lego-city', description: 'لگو شهر با 800 قطعه', price: 1800000, stock: 10, cat: 'toys', image: '/images/products/lego.svg', discount: 10, rating: 4.8, ratingCount: 140, sales: 60 },
      { name: 'عروسک باربی', slug: 'barbie-doll', description: 'عروسک باربی کلاسیک', price: 950000, stock: 18, cat: 'toys', image: '/images/products/doll.svg', discount: 5, rating: 4.6, ratingCount: 110, sales: 50 },
      { name: 'پازل 1000 قطعه', slug: 'puzzle-1000', description: 'پازل 1000 قطعه منظره', price: 480000, stock: 25, cat: 'toys', image: '/images/products/puzzle.svg', discount: 0, rating: 4.5, ratingCount: 95, sales: 45 },
      { name: 'ماشین کنترلی', slug: 'rc-car', description: 'ماشین کنترلی رادیویی', price: 1200000, stock: 12, cat: 'toys', image: '/images/products/rc-car.svg', discount: 8, rating: 4.4, ratingCount: 85, sales: 38 },
      { name: 'گلدان سرامیکی', slug: 'ceramic-vase', description: 'گلدان سرامیکی مدرن', price: 750000, stock: 20, cat: 'decor', image: '/images/products/vase.svg', discount: 0, rating: 4.5, ratingCount: 70, sales: 32 },
      { name: 'ست شمع معطر', slug: 'scented-candles', description: 'ست 3 عددی شمع معطر', price: 450000, stock: 30, cat: 'decor', image: '/images/products/candle.svg', discount: 5, rating: 4.4, ratingCount: 85, sales: 40 },
      { name: 'قاب عکس چوبی', slug: 'wooden-photo-frame', description: 'قاب عکس چوبی 20×30', price: 380000, stock: 35, cat: 'decor', image: '/images/products/photo-frame.svg', discount: 0, rating: 4.3, ratingCount: 60, sales: 28 },
      { name: 'ساعت دیواری کلاسیک', slug: 'wall-clock', description: 'ساعت دیواری با عقربه برنجی', price: 1200000, stock: 15, cat: 'decor', image: '/images/products/wall-clock.svg', discount: 8, rating: 4.6, ratingCount: 95, sales: 42 },
    ];

    let productCount = 0;
    for (const p of products) {
      const { cat, image, discount, sales, ...data } = p;
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: catIds[cat] },
        create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: catIds[cat] },
      });
      productCount++;
    }

    return Response.json({ success: true, message: `synced: ${cats.length} cats, ${productCount} products` });
  } catch (e) {
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
}

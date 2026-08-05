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

    // 2b) more products for the same categories
    const moreProducts = [
      { name: 'جارو شارژی دایسون', slug: 'dyson-vacuum', description: 'جاروبرقی شارژی دایسون', price: 28000000, stock: 4, cat: 'home-appliances', image: '/images/products/vacuum.svg', discount: 8, rating: 4.8, ratingCount: 95, sales: 22 },
      { name: 'ماشین لباسشویی سامسونگ', slug: 'washing-machine', description: 'ماشین لباسشویی 8 کیلو', price: 32000000, stock: 3, cat: 'home-appliances', image: '/images/products/microwave.svg', discount: 5, rating: 4.6, ratingCount: 65, sales: 18 },
      { name: 'یخچال فریزر بوش', slug: 'bosch-fridge', description: 'یخچال ساید بای ساید بوش', price: 85000000, stock: 2, cat: 'home-appliances', image: '/images/products/kettle.svg', discount: 3, rating: 4.7, ratingCount: 45, sales: 10 },
      { name: 'مخلوط‌کن سانرف', slug: 'sunbeam-blender', description: 'مخلوط‌کن 800 وات', price: 2800000, stock: 15, cat: 'home-appliances', image: '/images/products/blender.svg', discount: 10, rating: 4.4, ratingCount: 85, sales: 32 },
      { name: 'آبمیوه‌گیری پاناسونیک', slug: 'juicer-panasonic', description: 'آبمیوه‌گیری 700 وات', price: 5200000, stock: 10, cat: 'home-appliances', image: '/images/products/blender.svg', discount: 6, rating: 4.5, ratingCount: 70, sales: 25 },
      { name: 'ساندویچ‌ساز فیلیپس', slug: 'sandwich-maker', description: 'ساندویچ‌ساز 2 پرس', price: 1800000, stock: 20, cat: 'home-appliances', image: '/images/products/air-fryer.svg', discount: 0, rating: 4.3, ratingCount: 110, sales: 45 },
      { name: 'چرخ گوشت پارس‌خزر', slug: 'meat-grinder', description: 'چرخ گوشت 1800 وات', price: 6800000, stock: 8, cat: 'home-appliances', image: '/images/products/toolbox.svg', discount: 5, rating: 4.5, ratingCount: 55, sales: 20 },
      { name: 'سشوار سامسونگ', slug: 'samsung-dryer', description: 'سشوار 2200 وات', price: 2400000, stock: 18, cat: 'home-appliances', image: '/images/products/hairdryer.svg', discount: 7, rating: 4.2, ratingCount: 90, sales: 38 },
      { name: 'اتو پرسی ایستاده', slug: 'steam-press', description: 'اتو پرسی با مخزن 1.5 لیتر', price: 4500000, stock: 12, cat: 'home-appliances', image: '/images/products/iron.svg', discount: 0, rating: 4.4, ratingCount: 60, sales: 22 },
      { name: 'کیمیاگر', slug: 'book-alchemist', description: 'رمان کیمیاگر پائولو کوئلیو', price: 320000, stock: 40, cat: 'books', image: '/images/products/book-novel.svg', discount: 5, rating: 4.8, ratingCount: 310, sales: 165 },
      { name: 'ملت عشق', slug: 'book-love-nation', description: 'رمان ملت عشق الیف شافاک', price: 450000, stock: 35, cat: 'books', image: '/images/products/book-novel.svg', discount: 8, rating: 4.7, ratingCount: 280, sales: 140 },
      { name: 'شازده کوچولو', slug: 'book-little-prince', description: 'شازده کوچولو', price: 280000, stock: 50, cat: 'books', image: '/images/products/book-child.svg', discount: 0, rating: 4.9, ratingCount: 400, sales: 220 },
      { name: 'قورباغه را قورت بده', slug: 'book-eat-frog', description: 'کتاب برایان تریسی', price: 350000, stock: 45, cat: 'books', image: '/images/products/book-selfhelp.svg', discount: 6, rating: 4.5, ratingCount: 240, sales: 130 },
      { name: 'انسان خردمند', slug: 'book-sapiens', description: 'تاریخ مختصر بشر هراری', price: 580000, stock: 30, cat: 'books', image: '/images/products/book-tech.svg', discount: 10, rating: 4.8, ratingCount: 350, sales: 185 },
      { name: 'بوف کور', slug: 'book-blind-owl', description: 'بوف کور صادق هدایت', price: 260000, stock: 45, cat: 'books', image: '/images/products/book-poetry.svg', discount: 0, rating: 4.6, ratingCount: 300, sales: 160 },
      { name: 'جزء از کل', slug: 'book-part-whole', description: 'جزء از کل استیو تولتز', price: 490000, stock: 25, cat: 'books', image: '/images/products/book-novel.svg', discount: 7, rating: 4.7, ratingCount: 200, sales: 95 },
      { name: 'هنر جنگ', slug: 'book-art-war', description: 'هنر جنگ سان تزو', price: 220000, stock: 55, cat: 'books', image: '/images/products/book-selfhelp.svg', discount: 0, rating: 4.5, ratingCount: 260, sales: 145 },
      { name: 'عطر مردانه دیور ساواج', slug: 'perfume-dior-sauvage', description: 'عطر دیور ساواج', price: 8500000, stock: 8, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 5, rating: 4.8, ratingCount: 220, sales: 85 },
      { name: 'عطر زنانه شنل 5', slug: 'perfume-chanel-5', description: 'عطر شنل شماره 5', price: 12000000, stock: 6, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 3, rating: 4.7, ratingCount: 190, sales: 60 },
      { name: 'عطر مردانه بلو دو شانل', slug: 'perfume-bleu-chanel', description: 'بلو دو شانل', price: 9800000, stock: 7, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 0, rating: 4.8, ratingCount: 170, sales: 55 },
      { name: 'اسپری بدن آدیداس', slug: 'adidas-body-spray', description: 'اسپری بدن آدیداس', price: 350000, stock: 40, cat: 'perfume', image: '/images/products/perfume-unisex.svg', discount: 0, rating: 4.2, ratingCount: 300, sales: 180 },
      { name: 'عطر مردانه وان میل', slug: 'perfume-one-million', description: 'وان میل پاکو رابان', price: 7800000, stock: 9, cat: 'perfume', image: '/images/products/perfume-m.svg', discount: 6, rating: 4.6, ratingCount: 140, sales: 48 },
      { name: 'عطر زنانه لا وی بِل', slug: 'perfume-la-vie-belle', description: 'لا وی بِل لانکوم', price: 8900000, stock: 7, cat: 'perfume', image: '/images/products/perfume-w.svg', discount: 0, rating: 4.7, ratingCount: 130, sales: 42 },
      { name: 'ادکلن مردانه باس', slug: 'bass-cologne', description: 'ادکلن مردانه باس', price: 450000, stock: 35, cat: 'perfume', image: '/images/products/perfume-unisex.svg', discount: 5, rating: 4.1, ratingCount: 180, sales: 95 },
      { name: 'لگو شهر 800 قطعه', slug: 'lego-city', description: 'لگو شهر 800 قطعه', price: 1800000, stock: 10, cat: 'toys', image: '/images/products/lego.svg', discount: 10, rating: 4.8, ratingCount: 140, sales: 60 },
      { name: 'عروسک باربی', slug: 'barbie-doll', description: 'عروسک باربی کلاسیک', price: 950000, stock: 18, cat: 'toys', image: '/images/products/doll.svg', discount: 5, rating: 4.6, ratingCount: 110, sales: 50 },
      { name: 'پازل 1000 قطعه', slug: 'puzzle-1000', description: 'پازل 1000 قطعه', price: 480000, stock: 25, cat: 'toys', image: '/images/products/puzzle.svg', discount: 0, rating: 4.5, ratingCount: 95, sales: 45 },
      { name: 'ماشین کنترلی', slug: 'rc-car', description: 'ماشین کنترلی رادیویی', price: 1200000, stock: 12, cat: 'toys', image: '/images/products/rc-car.svg', discount: 8, rating: 4.4, ratingCount: 85, sales: 38 },
      { name: 'گلدان سرامیکی', slug: 'ceramic-vase', description: 'گلدان سرامیکی مدرن', price: 750000, stock: 20, cat: 'decor', image: '/images/products/vase.svg', discount: 0, rating: 4.5, ratingCount: 70, sales: 32 },
      { name: 'ست شمع معطر', slug: 'scented-candles', description: 'ست 3 عددی شمع معطر', price: 450000, stock: 30, cat: 'decor', image: '/images/products/candle.svg', discount: 5, rating: 4.4, ratingCount: 85, sales: 40 },
      { name: 'قاب عکس چوبی', slug: 'wooden-photo-frame', description: 'قاب عکس چوبی', price: 380000, stock: 35, cat: 'decor', image: '/images/products/photo-frame.svg', discount: 0, rating: 4.3, ratingCount: 60, sales: 28 },
      { name: 'ساعت دیواری کلاسیک', slug: 'wall-clock', description: 'ساعت دیواری کلاسیک', price: 1200000, stock: 15, cat: 'decor', image: '/images/products/wall-clock.svg', discount: 8, rating: 4.6, ratingCount: 95, sales: 42 },
    ];

    let productCount = 0;
    for (const p of [...products, ...moreProducts]) {
      const { cat, image, discount, sales, ...data } = p;
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: catIds[cat] },
        create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: catIds[cat] },
      });
      productCount++;
    }


    // 3) brand products so every brand search has results
    const brandProducts = [
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
    for (const p of brandProducts) {
      const cat = await prisma.category.findUnique({ where: { slug: p.cat } });
      if (!cat) continue;
      const { cat: _c, image, discount, sales, ...data } = p;
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, categoryId: cat.id },
        create: { ...data, imageUrl: image, discountPercent: discount, salesCount: sales, slug: p.slug, categoryId: cat.id },
      });
      productCount++;
    }

    return Response.json({ success: true, message: `synced: ${cats.length} cats, ${productCount} products` });
  } catch (e) {
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
}

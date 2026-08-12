import 'dotenv/config'
import { prisma } from '@/lib/prisma'
import { faNormalize } from '@/lib/search'
import fs from 'node:fs'
import path from 'node:path'

// ─── نقشه «شاخه → تصویر مناسب» ───
// برای شاخه‌هایی که features دارند، ترتیب images با ترتیب features هماهنگ است.
const TERM_IMAGES: Record<string, { features?: string[]; images: string[] }> = {
  آیفون: { features: ['۱۵ پرومکس', '۱۵', '۱۴ پرومکس', '۱۴'], images: ['/images/products/iphone-15-pro-max.svg', '/images/products/iphone-15.svg', '/images/products/iphone-14-pro-max.svg', '/images/products/iphone-14.svg'] },
  سامسونگ: { features: ['گلکسی A56', 'گلکسی S24 FE', 'گلکسی A36', 'گلکسی M35'], images: ['/images/products/samsung-a56.svg', '/images/products/samsung-s24-fe.svg', '/images/products/samsung-a36.svg', '/images/products/samsung-m35.svg', '/images/products/samsung-s24.svg', '/images/products/samsung-s24-ultra.svg', '/images/products/samsung-a55.svg'] },
  شیائومی: { features: ['ردمی نوت ۱۴', 'ردمی ۱۳', 'پوکو X6', 'ردمی ۱۴ سی'], images: ['/images/products/redmi-note-14.svg', '/images/products/redmi-13.svg', '/images/products/poco-x6.svg', '/images/products/redmi-14c.svg', '/images/products/xiaomi-14.svg'] },
  آنر: { features: ['ماجیک ۶ پرو', 'ایکس ۸', 'ماجیک V3', 'ایکس ۷'], images: ['/images/products/honor-magic-6-pro.svg', '/images/products/honor-x8.svg', '/images/products/honor-magic-v3.svg', '/images/products/honor-x7.svg', '/images/products/honor-magic-6.svg', '/images/products/honor-x9b.svg'] },
  'گوگل پیکسل': { features: ['پیکسل ۹ پرو', 'پیکسل ۸ پرو', 'پیکسل ۹ ای', 'پیکسل ۹'], images: ['/images/products/pixel-9-pro.svg', '/images/products/pixel-8-pro.svg', '/images/products/pixel-9a.svg', '/images/products/pixel-9.svg', '/images/products/pixel-8.svg'] },
  لنوو: { features: ['ایده‌پد 5', 'لژیون 5', 'ایده‌پد گیمینگ', 'ایده‌پد اسلیم'], images: ['/images/products/lenovo-ideapad-5.svg', '/images/products/lenovo-legion-5.svg', '/images/products/lenovo-ideapad-gaming.svg', '/images/products/lenovo-ideapad-slim.svg', '/images/products/thinkpad-x1.svg'] },
  ایسوس: { features: ['ویوا بوک 15', 'تی‌اف گیمینگ', 'زِن‌بوک 14', 'ویوا بوک 16'], images: ['/images/products/asus-vivobook-15.svg', '/images/products/asus-tuf-gaming.svg', '/images/products/asus-zenbook-14.svg', '/images/products/asus-vivobook-16.svg'] },
  'مک‌بوک': { features: ['ایر M3', 'پرو M3', 'ایر 15', 'پرو M4'], images: ['/images/products/macbook-air-m3.svg', '/images/products/macbook-pro-m3.svg', '/images/products/macbook-air-15.svg', '/images/products/macbook-pro-m4.svg'] },
  'اچ‌پی': { features: ['پاویلیون 15', 'اسپکتر x360', 'ویکتوس 16', 'پروبوک 450'], images: ['/images/products/hp-pavilion-15.svg', '/images/products/hp-spectre-x360.svg', '/images/products/hp-victus-16.svg', '/images/products/hp-probook-450.svg'] },
  دل: { features: ['ایناسپایرون 15', 'ایکس‌پی‌اس 13', 'لتیود 7450', 'گیمینگ G15'], images: ['/images/products/dell-inspiron-15.svg', '/images/products/dell-xps-13.svg', '/images/products/dell-latitude-7450.svg', '/images/products/dell-gaming-g15.svg'] },
  آیپد: { features: ['ایرد 5', 'مینی 7', 'نسل ۱۱', 'پرو 12.9'], images: ['/images/products/ipad-air.svg', '/images/products/ipad-mini-7.svg', '/images/products/ipad-gen-11.svg', '/images/products/ipad-pro-12-9.svg', '/images/products/ipad-pro-11.svg', '/images/products/ipad-mini-6.svg'] },
  'گلکسی تب': { features: ['S10+', 'S9 FE', 'A9+', 'S10'], images: ['/images/products/galaxy-tab-s10-plus.svg', '/images/products/galaxy-tab-s9-fe.svg', '/images/products/galaxy-tab-a9.svg', '/images/products/galaxy-tab-s10.svg', '/images/products/galaxy-tab.svg', '/images/products/galaxy-tab-s8.svg'] },
  'لنوو تب': { features: ['تب P12', 'تب M11', 'تب یوگا', 'تب P11 نسل ۲'], images: ['/images/products/lenovo-tab-p12.svg', '/images/products/lenovo-tab-m11.svg', '/images/products/lenovo-tab-yoga.svg', '/images/products/lenovo-tab-p11-gen2.svg', '/images/products/lenovo-tab-p11.svg', '/images/products/lenovo-tab-m10.svg'] },
  'اپل واچ': { features: ['سری 10', 'اولترا 2', 'سری 9', 'سری SE'], images: ['/images/products/apple-watch-s10.svg', '/images/products/apple-watch-ultra-2.svg', '/images/products/apple-watch-9.svg', '/images/products/apple-watch-se.svg', '/images/products/apple-watch.svg'] },
  'گلکسی واچ': { features: ['7 اولترا', '6 کلاسیک', 'FE', '7'], images: ['/images/products/galaxy-watch-7-ultra.svg', '/images/products/galaxy-watch-6-classic.svg', '/images/products/galaxy-watch-fe.svg', '/images/products/galaxy-watch-7.svg', '/images/products/galaxy-watch.svg', '/images/products/galaxy-watch-5-pro.svg'] },
  گارمین: { features: ['ونو 3', 'فنیکس 7', 'فوررنر 265', 'ونو اسکوئر'], images: ['/images/products/garmin-venu-3.svg', '/images/products/garmin-fenix-7.svg', '/images/products/garmin-forerunner-265.svg', '/images/products/garmin-venu-sq.svg'] },
  هدفون: { features: ['بی‌سیم سونی', 'روگوشی بلوتوثی', 'گیمینگ', 'بی‌سیم ریزر'], images: ['/images/products/sony-wh1000xm5.svg', '/images/products/sony-wh-ch720n.svg', '/images/products/razer-barracuda.svg', '/images/products/headset-hyperx.svg'] },
  اسپیکر: { features: ['بلوتوثی جی‌بی‌ال', 'بلوتوثی سونی', 'پارتی‌باکس', 'رومیزی'], images: ['/images/products/jbl-flip6.svg', '/images/products/sonos-one.svg', '/images/products/marshall-emberton.svg', '/images/products/desktop-speakers.svg'] },
  تلویزیون: { features: ['55 اینچ سامسونگ', '65 اینچ ال‌جی', '50 اینچ', '75 اینچ'], images: ['/images/products/tv-samsung-55.svg', '/images/products/tv-lg-65.svg', '/images/products/tv-samsung-55.svg', '/images/products/tv-lg-65.svg'] },
  ایرپادز: { features: ['پرو 2', 'نسل 4', 'پرو 3', 'نسل 3'], images: ['/images/products/airpods-pro.svg', '/images/products/airpods-4.svg', '/images/products/airpods-pro-3.svg', '/images/products/airpods-3.svg'] },
  ساندبار: { images: ['/images/products/soundbar-samsung.svg'] },
  مانیتور: { images: ['/images/products/asus-monitor-24.svg'] },
  کنسول: { images: ['/images/products/console.svg'] },
  مادربرد: { images: ['/images/products/motherboard.svg'] },
  ماوس: { images: ['/images/products/mouse-g502.svg', '/images/products/microsoft-wireless-mouse.svg'] },
  کیبورد: { images: ['/images/products/logitech-mechanical-keyboard.svg', '/images/products/keyboard-redragon.svg'] },
  'فلش مموری': { images: ['/images/products/sandisk-flash-64gb.svg'] },
  'هارد اکسترنال': { images: ['/images/products/seagate-hdd-1tb.svg'] },
  اتو: { features: ['بخار فیلیپس', 'بخار پارس‌خزر', 'مسافرتی', 'بخار ایستاده'], images: ['/images/products/steam-iron-philips.svg', '/images/products/iron.svg', '/images/products/iron.svg', '/images/products/iron.svg'] },
  کتری: { images: ['/images/products/kettle-bosch.svg', '/images/products/kettle.svg'] },
  سشوار: { images: ['/images/products/hairdryer.svg'] },
  پلوپز: { images: ['/images/products/rice-cooker.svg'] },
  مایکروویو: { images: ['/images/products/microwave.svg'] },
  جارو: { features: ['شارژی بی‌سیم', 'روبوت', 'باریک', 'خاکشی'], images: ['/images/products/cordless-vacuum-xiaomi.svg', '/images/products/vacuum.svg', '/images/products/vacuum.svg', '/images/products/vacuum.svg'] },
  'مخلوط‌کن': { images: ['/images/products/blender.svg'] },
  'سرخ‌کن': { features: ['بدون روغن فیلیپس', 'بدون روغن پارس‌خزر', '5 لیتری', '7 لیتری'], images: ['/images/products/air-fryer.svg', '/images/products/airfryer-parskhazar.svg', '/images/products/air-fryer.svg', '/images/products/airfryer-parskhazar.svg'] },
  یخچال: { features: ['ساید بای ساید ال‌جی', 'فریزر سامسونگ', 'فریزر پایین', '12 فوت'], images: ['/images/products/fridge-lg-sbs.svg', '/images/products/fridge-lg-sbs.svg', '/images/products/fridge-lg-sbs.svg', '/images/products/fridge-lg-sbs.svg'] },
  'ماشین لباسشویی': { images: ['/images/products/washer-samsung.svg'] },
  گلدان: { images: ['/images/products/vase.svg'] },
  شمع: { images: ['/images/products/candle.svg'] },
  'ساعت دیواری': { images: ['/images/products/wall-clock.svg'] },
  رومیزی: { images: ['/images/products/led-lamp.svg'] },
  آینه: { images: ['/images/products/mirror.svg'] },
  مردانه: { features: ['تیشرت پنبه‌ای', 'شلوار کتان', 'کت اسپرت', 'پولوشرت'], images: ['/images/products/tshirt.svg', '/images/products/chinos.svg', '/images/products/jacket.svg', '/images/products/shirt-casual.svg'] },
  پیراهن: { features: ['رسمی سفید', 'مجلسی مشکی', 'یقه‌دار', 'کتان'], images: ['/images/products/shirt-white.svg', '/images/products/shirt-casual.svg', '/images/products/shirt-casual.svg', '/images/products/shirt-white.svg'] },
  شلوار: { features: ['جین لی', 'کتان', 'کاپری', 'اسلش'], images: ['/images/products/jeans.svg', '/images/products/chinos.svg', '/images/products/jeans-blue.svg', '/images/products/shorts.svg'] },
  کفش: { features: ['اسپرت نایک', 'راحتی اسکچرز', 'رانینگ', 'پیاده‌روی'], images: ['/images/products/sneakers.svg', '/images/products/casual-shoes.svg', '/images/products/adidas-football.svg', '/images/products/shoes.svg'] },
  هودی: { features: ['پنبه‌ای', 'زیپ‌دار', 'طرح‌دار', 'گرمکن'], images: ['/images/products/hoodie.svg', '/images/products/windbreaker.svg', '/images/products/hoodie.svg', '/images/products/windbreaker.svg'] },
  آدیداس: { features: ['کفش رانینگ', 'هودی', 'شلوارک', 'تیشرت'], images: ['/images/products/adidas-football.svg', '/images/products/hoodie.svg', '/images/products/shorts.svg', '/images/products/tshirt.svg'] },
  چرم: { features: ['کمربند چرم', 'کیف دستی چرم', 'کیف پول چرم', 'ژاکت چرم'], images: ['/images/products/leather-belt-men.svg', '/images/products/leather-handbag-women.svg', '/images/products/leather-wallet.svg', '/images/products/jacket.svg'] },
  فیلیپس: { features: ['سشوار حرفه‌ای', 'اصلاح صورت', 'اصلاح بدن', 'مسواک برقی'], images: ['/images/products/hairdryer.svg', '/images/products/shaver.svg', '/images/products/shaver.svg', '/images/products/toothbrush.svg'] },
  اصلاح: { features: ['برقی فیلیپس', 'تریمر', 'تیغ براون', 'اصلاح صورت'], images: ['/images/products/shaver.svg', '/images/products/shaver-braun.svg', '/images/products/shaver-braun.svg', '/images/products/shaver.svg'] },
  'مراقبت پوست': { features: ['ست سرم', 'کرم مرطوب‌کننده', 'ضد آفتاب', 'کرم ضد چروک'], images: ['/images/products/garnier-skincare-set.svg', '/images/products/nivea-moisturizer.svg', '/images/products/sunscreen.svg', '/images/products/nivea-moisturizer.svg'] },
  'عطر مردانه': { images: ['/images/products/perfume-m.svg', '/images/products/perfume.svg'] },
  'عطر زنانه': { images: ['/images/products/perfume-w.svg', '/images/products/chanel-perfume-women.svg'] },
  ادکلن: { images: ['/images/products/perfume.svg', '/images/products/perfume-unisex.svg'] },
  یونیسکس: { images: ['/images/products/perfume-unisex.svg'] },
  کوله: { images: ['/images/products/hiking-backpack.svg'] },
  کمپینگ: { features: ['چادر 2 نفره', 'فانوس', 'کیسه خواب', 'میز تاشو'], images: ['/images/products/tent.svg', '/images/products/camping-lantern.svg', '/images/products/sleeping-bag.svg', '/images/products/tent.svg'] },
  دوچرخه: { images: ['/images/products/giant-mountain-bike.svg'] },
  فوتبال: { images: ['/images/products/adidas-football.svg'] },
  یوگا: { images: ['/images/products/yoga-mat.svg'] },
  داستان: { images: ['/images/products/book-novel.svg', '/images/products/book-child.svg'] },
  رمان: { images: ['/images/products/book-novel.svg', '/images/products/book-selfhelp.svg'] },
  هنر: { images: ['/images/products/book-tech.svg', '/images/products/book-poetry.svg'] },
  لگو: { images: ['/images/products/lego.svg'] },
  عروسک: { images: ['/images/products/doll.svg'] },
  پازل: { images: ['/images/products/puzzle.svg'] },
  'ماشین کنترلی': { images: ['/images/products/rc-car.svg'] },
  روغن: { images: ['/images/products/sunflower-oil-ladan.svg', '/images/products/olive-oil.svg'] },
  چای: { images: ['/images/products/tea.svg'] },
  قهوه: { images: ['/images/products/coffee.svg'] },
  شیر: { images: ['/images/products/milk.svg'] },
  برنج: { images: ['/images/products/rice-tarom.svg'] },
  سکه: { features: ['تمام بهار', 'نیم', 'ربع', 'امامی'], images: ['/images/products/gold-coin.svg', '/images/products/half-gold-coin.svg', '/images/products/quarter-gold-coin.svg', '/images/products/parsian-coin.svg'] },
  شمش: { images: ['/images/products/gold-bar.svg', '/images/products/gold-bar-half-g.svg'] },
  انگشتر: { images: ['/images/products/gold-ring.svg', '/images/products/silver-ring-men.svg'] },
  گردنبند: { images: ['/images/products/gold-chain-men.svg', '/images/products/silver-chain.svg', '/images/products/gold-bracelet.svg', '/images/products/gold-bangle.svg'] },
  دریل: { images: ['/images/products/drill.svg', '/images/products/hammer-drill.svg'] },
  'پیچ‌گوشتی': { images: ['/images/products/screwdriver-bosch.svg', '/images/products/screwdriver-set.svg'] },
  شارژی: { features: ['دریل', 'پیچ‌گوشتی', 'اره‌موتوری', 'جارو'], images: ['/images/products/drill.svg', '/images/products/screwdriver-bosch.svg', '/images/products/jigsaw-makita.svg', '/images/products/vacuum.svg'] },
  'جعبه ابزار': { images: ['/images/products/rolling-toolbox.svg', '/images/products/toolbox.svg'] },
  لیزری: { features: ['متر لیزری', 'تراز لیزری', 'سطح 360', 'دوربین'], images: ['/images/products/laser-meter-bosch.svg', '/images/products/laser-level.svg', '/images/products/laser-level.svg', '/images/products/laser-level.svg'] },
}

// تصاویری که فقط نام فایلشان اشتباه است
const IMAGE_ALIASES: Record<string, string> = {
  '/images/products/rtx-4070.svg': '/images/products/rtx4070.svg',
}

// اصلاح دستی تصویر محصولات پایه (غیر sf-) که تصویرشان با کالا نمی‌خواند
const BASE_IMAGE_FIX: Record<string, string> = {
  'redmi-note-13': '/images/products/redmi-note-13.svg',
  'iphone-13': '/images/products/iphone-13.svg',
  'iphone-14': '/images/products/iphone-14.svg',
  'galaxy-a54': '/images/products/samsung-a54.svg',
  'xiaomi-powerbank': '/images/products/powerbank-xiaomi.svg',
  'samsung-monitor': '/images/products/samsung-monitor.svg',
  'sony-a7': '/images/products/sony-camera-a7.svg',
  'homepod-mini': '/images/products/homepod-mini.svg',
  'galaxy-buds2': '/images/products/galaxy-buds2.svg',
  'jbl-tune': '/images/products/jbl-tune.svg',
  'jbl-live-660': '/images/products/jbl-live-660.svg',
  'xiaomi-earbuds': '/images/products/xiaomi-earbuds.svg',
  'sony-speaker': '/images/products/sony-speaker.svg',
  'asus-motherboard': '/images/products/motherboard.svg',
  'ps5': '/images/products/console.svg',
  'ps4': '/images/products/console.svg',
  'ps5-digital': '/images/products/console.svg',
  'gaming-mouse': '/images/products/mouse-g502.svg',
  'gaming-case': '/images/products/pc-case.svg',
  'asus-router': '/images/products/asus-router.svg',
  'asus-monitor': '/images/products/asus-monitor-24.svg',
  'gaming-monitor': '/images/products/asus-monitor-24.svg',
  'gaming-headset': '/images/products/razer-barracuda.svg',
  'sandwich-maker': '/images/products/sandwich-maker.svg',
  'tefal-pot': '/images/products/tefal-pot.svg',
  'bosch-fridge': '/images/products/bosch-fridge.svg',
  'meat-grinder': '/images/products/meat-grinder.svg',
  'electric-tenderizer': '/images/products/meat-grinder.svg',
  'washing-machine': '/images/products/washer-samsung.svg',
  'tefal-pan': '/images/products/tefal-pan.svg',
  'tefal-grill': '/images/products/tefal-grill.svg',
  'asus-rog-g16': '/images/products/asus-rog-strix-g16.svg',
  'mac-mini-m2': '/images/products/mac-mini-m2.svg',
  'lenovo-mouse': '/images/products/mouse-g502.svg',
  'lenovo-keyboard': '/images/products/keyboard-redragon.svg',
  'lenovo-ideapad': '/images/products/lenovo-ideapad-5.svg',
  'asus-vivobook': '/images/products/asus-vivobook-15.svg',
  'lenovo-legion': '/images/products/lenovo-legion-5.svg',
  'mi-band-8': '/images/products/xiaomi-band-8.svg',
  'xiaomi-watch': '/images/products/xiaomi-watch.svg',
  'galaxy-watch-6': '/images/products/galaxy-watch-6.svg',
  'apple-watch-9': '/images/products/apple-watch-9.svg',
  'apple-watch-se': '/images/products/apple-watch-se.svg',
  'decor-rug': '/images/products/decor-rug.svg',
  'modern-mirror': '/images/products/mirror.svg',
  'adidas-cap': '/images/products/cap-men.svg',
  'nike-backpack': '/images/products/hiking-backpack.svg',
  'adidas-backpack': '/images/products/hiking-backpack.svg',
  'xiaomi-scooter': '/images/products/xiaomi-scooter.svg',
  'lenovo-tab': '/images/products/lenovo-tab-p11.svg',
  'galaxy-tab-s9': '/images/products/galaxy-tab-s9.svg',
  'ipad-10th': '/images/products/ipad-gen-10.svg',
  'ipad-pro-m4': '/images/products/ipad-pro-m4.svg',
  'vacuum-dyson': '/images/products/cordless-vacuum-dyson.svg',
  'dyson-vacuum': '/images/products/cordless-vacuum-dyson.svg',
}

const CITIES = ['تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'رشت']

// فروشگاه‌های تخصصی به تفکیک دسته، تا نام فروشنده با نوع محصول همخوان باشد
const SHOP_POOLS: Record<string, string[]> = {
  mobile: ['موبایل مارکت مرکزی', 'فروشگاه موبایل پارس', 'موبایل سنتر', 'فروشگاه تلفن همراه آریا'],
  laptop: ['فروشگاه لپ‌تاپ تکنو', 'لپ‌تاپ سنتر', 'شاپ کامپیوتر پارس', 'فروشگاه دیجیتال آریا'],
  tablet: ['فروشگاه تبلت و موبایل', 'دیجیتال سنتر', 'شاپ تبلت پارس', 'فروشگاه تکنو'],
  smartwatch: ['فروشگاه ساعت و پوشیدنی', 'دیجیتال شاپ', 'فروشگاه گجت پارس', 'تکنو مارکت'],
  audio: ['فروشگاه صوتی و تصویری پارس', 'هایپر دیجیتال', 'شاپ سمعی بصری', 'فروشگاه تکنو صدا'],
  gpu: ['فروشگاه قطعات کامپیوتر', 'گیمینگ سنتر', 'شاپ سخت‌افزار پارس', 'کامپیوتر مارکت'],
  'computer-accessories': ['فروشگاه لوازم جانبی کامپیوتر', 'اکسسوری سنتر', 'شاپ جانبی پارس', 'فروشگاه تکنو لوازم'],
  'home-appliances': ['فروشگاه لوازم خانگی پارس', 'لوازم خانگی مرکزی', 'هایپر لوازم خانگی', 'فروشگاه برقی آریا'],
  home: ['فروشگاه خانه و آشپزخانه', 'هایپر مارکت منزل', 'شاپ لوازم خانه', 'فروشگاه آشپزخانه پارس'],
  decor: ['دکوراسیون منزل پارس', 'فروشگاه دکوراتیو', 'شاپ دکور آریا', 'گالری دکوراسیون'],
  clothing: ['بوتیک پوشاک پارس', 'فروشگاه پوشاک مدرن', 'بوتیک سنتر', 'شاپ لباس آریا'],
  fashion: ['بوتیک مد و لباس', 'فروشگاه فشن پارس', 'بوتیک آریا', 'گالری مد'],
  beauty: ['فروشگاه آرایشی بهداشتی گلس', 'زیبایی سنتر', 'شاپ آرایشی پارس', 'بهداشتی و آرایشی آریا'],
  perfume: ['عطر و ادکلن مرکزی', 'فروشگاه عطر پارس', 'عطاری آنلاین', 'بوتیک عطر آریا'],
  sports: ['فروشگاه ورزشی پارس', 'اسپرت سنتر', 'شاپ ورزشی آریا', 'فروشگاه کوهنوردی'],
  books: ['کتاب‌فروشی پارس', 'بوک سنتر', 'فروشگاه کتاب آریا', 'کتاب‌خانه آنلاین'],
  toys: ['فروشگاه اسباب‌بازی پارس', 'توی سنتر', 'شاپ اسباب‌بازی آریا', 'فروشگاه بازی و سرگرمی'],
  supermarket: ['سوپرمارکت آنلاین', 'مارکت سنتر', 'هایپر مارکت پارس', 'سوپرمارکت آریا'],
  'gold-silver': ['زرگری آریا', 'طلا و جواهر پارس', 'فروشگاه طلا سنتر', 'جواهری آریا'],
  tools: ['فروشگاه ابزار پارس', 'ابزار سنتر', 'شاپ ابزار آریا', 'فروشگاه ابزارآلات مرکزی'],
}
const DEFAULT_SHOPS = ['فروشگاه دیجی‌تک', 'مارکت آنلاین پارس', 'فروشگاه تکنو', 'شاپ آنلاین مهر', 'فروشگاه مدرن', 'فروشگاه آسان', 'مارکت پلاس', 'فروشگاه روز']

const FEMALE_NAMES = [
  'مریم صادقی', 'نازنین کریمی', 'شیرین افشار', 'الهام موسوی', 'سمیرا قاسمی',
  'نگار رستمی', 'سارا محمدی', 'فاطمه احمدی', 'زهرا حسینی', 'مینا رضایی',
  'آیدا کریمی', 'گلاره نادری', 'شیما موسوی', 'ریحانه صادقی', 'ترانه عباسی',
]

const MALE_NAMES = [
  'فرزاد محمدی', 'آرش رضایی', 'رضا نادری', 'حمید کاظمی', 'پویا احمدی',
  'امیر حسینی', 'مهدی کریمی', 'علی رستمی', 'حسین قاسمی', 'سعید موسوی',
  'بهرام عباسی', 'کاوه صادقی', 'نیما افشار', 'آرمین یوسفی',
]

// احتمال انتخاب نام زنانه به تفکیک دسته (لوازم آرایشی → زن، ابزارآلات → مرد)
const GENDER_BIAS: Record<string, number> = {
  beauty: 0.8, perfume: 0.75, fashion: 0.65, clothing: 0.65, decor: 0.6,
  tools: 0.15, gpu: 0.25, 'computer-accessories': 0.25, sports: 0.25,
}

const REVIEW_TEMPLATES = [
  { rating: 5, title: 'عالی بود', text: 'کیفیت عالی و ارسال سریع. کاملاً راضی هستم.', verified: true },
  { rating: 3, title: 'متوسط', text: 'قابل قبول بود ولی با توجه به قیمت انتظار بیشتری داشتم.', verified: true },
  { rating: 4, title: 'خوب', text: 'محصول خوبیه، فقط کاش بسته‌بندی بهتری داشت.', verified: false },
  { rating: 5, title: 'عالی', text: 'دقیقاً همون چیزی بود که می‌خواستم. ممنون از فروشگاه.', verified: true },
  { rating: 4, title: 'راضی هستم', text: 'ارسال به موقع و محصول مطابق توضیحات.', verified: true },
  { rating: 5, title: 'پیشنهاد می‌کنم', text: 'از خریدم خیلی راضی‌ام. حتماً دوباره خرید می‌کنم.', verified: true },
  { rating: 4, title: 'ارزش خرید دارد', text: 'در برابر قیمت، عملکرد خوبی ارائه می‌دهد. استفاده از آن راضی‌کننده بود.', verified: true },
  { rating: 5, title: 'فوق‌العاده', text: 'بسته‌بندی تمیز، ارسال به موقع و محصول باکیفیت. کاملاً رضایت‌بخش بود.', verified: true },
  { rating: 2, title: 'انتظار نداشتم', text: 'کیفیت برای من رضایت‌بخش نبود و پشتیبانی هم نتوانست کمک کند.', verified: false },
  { rating: 5, title: 'خرید عالی', text: 'همه‌چیز دقیقاً مطابق توضیحات بود. از خریدم راضی هستم.', verified: true },
  { rating: 4, title: 'مناسب', text: 'محصول کار راه‌انداز است و کیفیت قابل قبولی دارد.', verified: true },
  { rating: 5, title: 'بهترین انتخاب', text: 'برای استفاده روزمره گزینه مناسبی است. پیشنهاد می‌کنم.', verified: true },
]

function pickAuthor(catSlug: string | undefined, seed: number): string {
  const fProb = GENDER_BIAS[catSlug || ''] ?? 0.5
  const r = (hashStr(String(seed)) % 100) / 100
  const pool = r < fProb ? FEMALE_NAMES : MALE_NAMES
  return pool[seed % pool.length]
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function findTerm(name: string): string | null {
  const n = faNormalize(name)
  const terms = Object.keys(TERM_IMAGES)

  // ۱) شاخه در ابتدای نام (شاخه‌های ویژگی): «یخچال فریزر پایین ... مدل»
  let best: string | null = null
  let bestLen = 0
  for (const t of terms) {
    const tn = faNormalize(t)
    if (tn && n.startsWith(tn) && tn.length > bestLen) {
      best = t
      bestLen = tn.length
    }
  }
  if (best) return best

  // ۲) شاخه درست قبل از «مدل» (شاخه‌های برند): «ردمی نوت ۱۴ شیائومی مدل»
  const tokens = n.split(' ').filter(Boolean)
  const mi = tokens.indexOf('مدل')
  if (mi > 0) {
    for (let k = 3; k >= 1; k--) {
      if (mi - k < 0) continue
      const slice = tokens.slice(mi - k, mi).join(' ')
      for (const t of terms) {
        if (faNormalize(t) === slice) return t
      }
    }
  }
  return null
}

function pickImage(name: string, slug: string, current: string | null): string | null {
  const term = findTerm(name)
  if (!term) return current
  const cfg = TERM_IMAGES[term]
  const n = faNormalize(name)
  let idx = -1
  if (cfg.features) {
    for (let i = 0; i < cfg.features.length; i++) {
      if (n.includes(faNormalize(cfg.features[i]))) {
        idx = i
        break
      }
    }
  }
  if (idx === -1) idx = hashStr(slug) % cfg.images.length
  return cfg.images[idx % cfg.images.length]
}

// تولید فایل SVG برای هر تصویری که فایلش وجود ندارد (مشابه fix-missing-images)
const CATEGORY_ICONS: Record<string, string> = {
  mobile: '📱', laptop: '💻', tablet: '📲', smartwatch: '⌚', audio: '🎧',
  'home-appliances': '☕', home: '🏠', beauty: '💄', perfume: '🌸',
  sports: '🏃', books: '📚', toys: '🧸', supermarket: '🛒', fashion: '👗',
  clothing: '👕', tools: '🔧', gpu: '🎮', 'computer-accessories': '🖱️',
  decor: '🏺', 'gold-silver': '🥇',
}
const BG_COLORS = ['#f2f2f7', '#e8f4fd', '#fdf3e3', '#e6f7e9', '#f9e8f4', '#eef4fa', '#f5edf9', '#eef7ec']

function ensureSvg(imageUrl: string) {
  const name = imageUrl.split('/').pop()?.replace('.svg', '')
  if (!name) return
  const dir = path.join(process.cwd(), 'public/images/products')
  const file = path.join(dir, `${name}.svg`)
  if (fs.existsSync(file)) return
  fs.mkdirSync(dir, { recursive: true })
  const bg = BG_COLORS[hashStr(name) % BG_COLORS.length]
  const icon = Object.values(CATEGORY_ICONS)[hashStr(name) % Object.keys(CATEGORY_ICONS).length]
  const label = name.replace(/-/g, ' ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${bg}"/>
  <circle cx="300" cy="240" r="130" fill="#ffffff" opacity="0.25"/>
  <g transform="translate(300,240)">
    <text font-size="170" text-anchor="middle" dominant-baseline="central">${icon}</text>
  </g>
  <text x="300" y="470" font-family="Tahoma, Arial, sans-serif" font-size="30" font-weight="bold" fill="#424750" text-anchor="middle">${label}</text>
  <text x="300" y="515" font-family="Tahoma, Arial, sans-serif" font-size="22" fill="#81858B" text-anchor="middle" direction="rtl">فروشگاه دیجی‌کلون</text>
</svg>`
  fs.writeFileSync(file, svg)
}

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } })

  let descFixed = 0
  let imgFixed = 0

  for (const p of products) {
    // ۱) بازسازی توضیح با نام فعلی (نام پس از fixName)
    if (p.description && p.description.includes('»')) {
      const rest = p.description.slice(p.description.indexOf('»') + 1).trim()
      const expected = `«${p.name}» ${rest}`
      if (p.description !== expected) {
        await prisma.product.update({ where: { id: p.id }, data: { description: expected } })
        descFixed++
      }
    }

    // ۲) تصویر مناسب برای شاخه (فقط sf-) و اصلاح دستی محصولات پایه
    if (p.slug.startsWith('sf-')) {
      const newImage = pickImage(p.name, p.slug, p.imageUrl)
      if (newImage && newImage !== p.imageUrl) {
        await prisma.product.update({ where: { id: p.id }, data: { imageUrl: newImage } })
        p.imageUrl = newImage
        imgFixed++
      }
    } else {
      const fixedImage = BASE_IMAGE_FIX[p.slug]
      if (fixedImage && fixedImage !== p.imageUrl) {
        await prisma.product.update({ where: { id: p.id }, data: { imageUrl: fixedImage } })
        p.imageUrl = fixedImage
        imgFixed++
      }
    }

    // ۳) اصلاح نام فایل‌های تصویر
    const aliased = IMAGE_ALIASES[p.imageUrl || '']
    if (aliased && aliased !== p.imageUrl) {
      await prisma.product.update({ where: { id: p.id }, data: { imageUrl: aliased } })
      p.imageUrl = aliased
    }
  }

  console.log(`Descriptions fixed: ${descFixed} | Images fixed: ${imgFixed}`)

  // ۴) فروشنده و نظر: نام فروشگاه تخصصیِ دسته + نویسنده متناسب با جنسیتِ دسته
  let vendorCount = 0
  let vendorRenamed = 0
  let reviewCount = 0
  let reviewAuthorUpdated = 0
  for (const product of products) {
    const catSlug = product.category?.slug
    const shopPool = SHOP_POOLS[catSlug || ''] ?? DEFAULT_SHOPS

    const vendors = await prisma.vendor.findMany({ where: { productId: product.id }, orderBy: { id: 'asc' } })
    if (vendors.length === 0) {
      const n = 1 + (product.id % 2)
      for (let i = 0; i < n; i++) {
        const city = CITIES[(product.id + i) % CITIES.length]
        const priceDelta = (product.id % 5) - 2
        await prisma.vendor.create({
          data: {
            productId: product.id,
            name: shopPool[(product.id + i) % shopPool.length],
            city,
            address: `${city}، خیابان اصلی، پلاک ${10 + (product.id % 90)}`,
            phone: `۰۲۱-${String(10000000 + product.id * 137).slice(0, 8)}`,
            rating: 4 + (product.id % 10) / 10,
            price: Math.round(product.price * (1 + priceDelta / 100)),
            stock: 1 + (product.id % 15),
          },
        })
        vendorCount++
      }
    } else {
      for (let i = 0; i < vendors.length; i++) {
        const name = shopPool[(product.id + i) % shopPool.length]
        if (vendors[i].name !== name) {
          await prisma.vendor.update({ where: { id: vendors[i].id }, data: { name } })
          vendorRenamed++
        }
      }
    }

    const reviews = await prisma.review.findMany({ where: { productId: product.id }, orderBy: { id: 'asc' } })
    if (reviews.length === 0) {
      const n = 2 + (product.id % 2)
      for (let i = 0; i < n; i++) {
        const t = REVIEW_TEMPLATES[(product.id + i) % REVIEW_TEMPLATES.length]
        await prisma.review.create({
          data: {
            productId: product.id,
            author: pickAuthor(catSlug, product.id + i),
            date: `۱۴۰۳/${String(1 + (product.id % 12)).padStart(2, '0')}/${String(1 + i * 8).padStart(2, '0')}`,
            rating: t.rating,
            title: t.title,
            text: t.text,
            verified: t.verified,
          },
        })
        reviewCount++
      }
    } else {
      for (let i = 0; i < reviews.length; i++) {
        const author = pickAuthor(catSlug, product.id + i)
        if (reviews[i].author !== author) {
          await prisma.review.update({ where: { id: reviews[i].id }, data: { author } })
          reviewAuthorUpdated++
        }
      }
    }
  }
  console.log(`Vendors +${vendorCount}, renamed ${vendorRenamed} | Reviews +${reviewCount}, author updated ${reviewAuthorUpdated}`)

  // ۵) اطمینان از وجود فایل همه تصاویر
  const urls = [...new Set(products.map((p) => p.imageUrl).filter(Boolean) as string[])]
  let svgCreated = 0
  for (const u of urls) {
    const file = path.join(process.cwd(), 'public', u)
    if (!fs.existsSync(file)) {
      ensureSvg(u)
      svgCreated++
    }
  }

  const total = await prisma.product.count()
  const withVendor = await prisma.vendor.groupBy({ by: ['productId'] })
  const withReview = await prisma.review.groupBy({ by: ['productId'] })
  console.log(`Subcat fix ✅ +${vendorCount} vendors, +${reviewCount} reviews, +${svgCreated} svgs; ${withVendor.length}/${total} with vendor, ${withReview.length}/${total} with review`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

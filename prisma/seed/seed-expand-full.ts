import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type NewProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  discount: number;
  rating: number;
  ratingCount: number;
  sales: number;
};

// دسته‌بندی‌هایی که باید در دسته دیگری ادغام شوند (اسلاگ مبدا -> اسلاگ مقصد)
const CATEGORY_MERGES: { from: string; into: string }[] = [
  { from: "home-kitchen", into: "home" },
  { from: "beauty-health", into: "beauty" },
];

// محصولات جدیدی که برای پر شدن هر ردیف (۱۴ محصول در هر دسته) اضافه می‌شوند
const NEW_PRODUCTS_BY_CATEGORY: Record<string, NewProduct[]> = {
  mobile: [
    { name: "آنر مجیک 6", slug: "honor-magic-6", description: "گوشی پرچمدار آنر با دوربین هوش مصنوعی و باتری ۵۶۰۰ میلی‌آمپر", price: 42000000, stock: 10, discount: 8, rating: 4.5, ratingCount: 210, sales: 95 },
    { name: "وان‌پلاس 12", slug: "oneplus-12", description: "گوشی وان‌پلاس با شارژ سریع ۱۰۰ واتی و تراشه اسنپدراگون 8 Gen 3", price: 39000000, stock: 12, discount: 6, rating: 4.6, ratingCount: 340, sales: 130 },
    { name: "سونی اکسپریا 1 وی", slug: "sony-xperia-1v", description: "گوشی سونی با دوربین حرفه‌ای زایس و نمایشگر 4K", price: 47000000, stock: 5, discount: 0, rating: 4.3, ratingCount: 85, sales: 30 },
    { name: "نوکیا G42", slug: "nokia-g42", description: "گوشی اقتصادی نوکیا با بدنه قابل تعمیر و اندروید خالص", price: 9800000, stock: 22, discount: 5, rating: 4.1, ratingCount: 160, sales: 210 },
    { name: "موتورولا اج 40", slug: "motorola-edge-40", description: "گوشی موتورولا با صفحه‌نمایش خمیده و شارژ بی‌سیم", price: 21000000, stock: 14, discount: 10, rating: 4.4, ratingCount: 145, sales: 88 },
    { name: "آیفون 14", slug: "iphone-14", description: "آیفون ۱۴ اپل با تراشه A15 Bionic و دوربین دوگانه", price: 38000000, stock: 9, discount: 12, rating: 4.7, ratingCount: 980, sales: 320 },
    { name: "سامسونگ گلکسی A55", slug: "samsung-a55", description: "گوشی میان‌رده سامسونگ با بدنه فلزی و دوربین ۵۰ مگاپیکسلی", price: 18500000, stock: 20, discount: 7, rating: 4.4, ratingCount: 410, sales: 260 },
    { name: "شیائومی ردمی نوت 13", slug: "redmi-note-13", description: "گوشی اقتصادی شیائومی با صفحه‌نمایش آمولد و شارژ سریع", price: 12500000, stock: 30, discount: 9, rating: 4.3, ratingCount: 520, sales: 410 },
    { name: "آنر X9b", slug: "honor-x9b", description: "گوشی آنر با بدنه ضدضربه و باتری پرظرفیت ۵۸۰۰ میلی‌آمپر", price: 15800000, stock: 16, discount: 0, rating: 4.2, ratingCount: 180, sales: 120 },
  ],
  laptop: [
    { name: "ایسر اسپایر 5", slug: "acer-aspire-5", description: "لپ‌تاپ اقتصادی ایسر مناسب کارهای روزمره و اداری", price: 32000000, stock: 12, discount: 6, rating: 4.2, ratingCount: 230, sales: 150 },
    { name: "اچ‌پی پاویلیون 15", slug: "hp-pavilion-15", description: "لپ‌تاپ همه‌کاره اچ‌پی با پردازنده اینتل نسل ۱۳", price: 41000000, stock: 8, discount: 5, rating: 4.4, ratingCount: 310, sales: 175 },
    { name: "دل ایکس‌پی‌اس 13", slug: "dell-xps-13", description: "لپ‌تاپ فوق‌سبک دل با نمایشگر InfinityEdge", price: 68000000, stock: 4, discount: 0, rating: 4.7, ratingCount: 420, sales: 95 },
    { name: "ایسوس زن‌بوک 14", slug: "asus-zenbook-14", description: "لپ‌تاپ سبک ایسوس با بدنه آلومینیومی و باتری طولانی", price: 44000000, stock: 7, discount: 8, rating: 4.5, ratingCount: 260, sales: 130 },
    { name: "لنوو لیجن 5", slug: "lenovo-legion-5", description: "لپ‌تاپ گیمینگ لنوو با کارت گرافیک RTX 4060", price: 78000000, stock: 5, discount: 10, rating: 4.6, ratingCount: 380, sales: 140 },
    { name: "مک‌بوک ایر M2", slug: "macbook-air-m2", description: "مک‌بوک ایر اپل با تراشه M2 و طراحی فوق‌سبک", price: 62000000, stock: 6, discount: 4, rating: 4.8, ratingCount: 1650, sales: 340 },
    { name: "ایسر نیترو 5", slug: "acer-nitro-5", description: "لپ‌تاپ گیمینگ ایسر با نرخ تازه‌سازی ۱۴۴ هرتز", price: 55000000, stock: 6, discount: 7, rating: 4.4, ratingCount: 290, sales: 165 },
    { name: "مایکروسافت سرفیس لپ‌تاپ 5", slug: "surface-laptop-5", description: "لپ‌تاپ مایکروسافت با نمایشگر لمسی و طراحی مینیمال", price: 71000000, stock: 3, discount: 0, rating: 4.5, ratingCount: 145, sales: 60 },
    { name: "اچ‌پی اسپکتر ایکس360", slug: "hp-spectre-x360", description: "لپ‌تاپ تبدیل‌شونده اچ‌پی با نمایشگر OLED", price: 89000000, stock: 3, discount: 6, rating: 4.7, ratingCount: 210, sales: 55 },
    { name: "دل اینسپایرون 15", slug: "dell-inspiron-15", description: "لپ‌تاپ خانگی دل مناسب دانشجویان و کارهای عمومی", price: 29000000, stock: 15, discount: 9, rating: 4.1, ratingCount: 380, sales: 220 },
  ],
  tablet: [
    { name: "آیپد پرو 11", slug: "ipad-pro-11", description: "تبلت حرفه‌ای اپل با تراشه M4 و نمایشگر Liquid Retina", price: 78000000, stock: 4, discount: 0, rating: 4.9, ratingCount: 560, sales: 90 },
    { name: "لنوو تب P11", slug: "lenovo-tab-p11", description: "تبلت لنوو با نمایشگر 2K و اسپیکر چهارگانه", price: 19500000, stock: 12, discount: 8, rating: 4.3, ratingCount: 180, sales: 110 },
    { name: "آمازون فایر HD 10", slug: "fire-hd-10", description: "تبلت اقتصادی آمازون مناسب مطالعه و سرگرمی", price: 8900000, stock: 20, discount: 12, rating: 4.0, ratingCount: 420, sales: 260 },
    { name: "سامسونگ گلکسی تب A9", slug: "galaxy-tab-a9", description: "تبلت اقتصادی سامسونگ با بدنه فلزی", price: 11500000, stock: 18, discount: 5, rating: 4.2, ratingCount: 310, sales: 195 },
    { name: "شیائومی پد 6", slug: "xiaomi-pad-6", description: "تبلت شیائومی با نمایشگر ۱۴۴ هرتز و پردازنده اسنپدراگون", price: 17800000, stock: 10, discount: 10, rating: 4.5, ratingCount: 240, sales: 130 },
    { name: "هوآوی میت‌پد 11", slug: "huawei-matepad-11", description: "تبلت هوآوی با قلم M-Pencil و صفحه ۱۲۰ هرتز", price: 21000000, stock: 8, discount: 6, rating: 4.4, ratingCount: 150, sales: 75 },
    { name: "مایکروسافت سرفیس گو 4", slug: "surface-go-4", description: "تبلت دوکاره مایکروسافت با ویندوز کامل", price: 34000000, stock: 5, discount: 0, rating: 4.3, ratingCount: 95, sales: 40 },
    { name: "آیپد مینی 6", slug: "ipad-mini-6", description: "تبلت جمع‌وجور اپل با تراشه A15 Bionic", price: 32000000, stock: 9, discount: 5, rating: 4.7, ratingCount: 680, sales: 210 },
    { name: "لنوو تب M10", slug: "lenovo-tab-m10", description: "تبلت اقتصادی لنوو مناسب استفاده خانوادگی", price: 9800000, stock: 22, discount: 8, rating: 4.0, ratingCount: 260, sales: 190 },
    { name: "سامسونگ گلکسی تب S8", slug: "galaxy-tab-s8", description: "تبلت حرفه‌ای سامسونگ با قلم S-Pen همراه", price: 36000000, stock: 6, discount: 9, rating: 4.6, ratingCount: 420, sales: 150 },
    { name: "تبلت آموزشی کودک", slug: "kids-learning-tablet", description: "تبلت مخصوص کودکان با محتوای آموزشی و بدنه ضدضربه", price: 6200000, stock: 25, discount: 0, rating: 4.2, ratingCount: 190, sales: 240 },
  ],
  smartwatch: [
    { name: "شیائومی بند 8", slug: "mi-band-8", description: "مچ‌بند هوشمند شیائومی با تشخیص ضربان قلب و اکسیژن خون", price: 2100000, stock: 30, discount: 10, rating: 4.5, ratingCount: 1240, sales: 680 },
    { name: "گارمین ونو 3", slug: "garmin-venu-3", description: "ساعت هوشمند ورزشی گارمین با باتری ۱۴ روزه", price: 24500000, stock: 6, discount: 0, rating: 4.7, ratingCount: 210, sales: 65 },
    { name: "هوآوی واچ GT4", slug: "huawei-watch-gt4", description: "ساعت هوشمند هوآوی با طراحی کلاسیک و سنجش سلامت", price: 15800000, stock: 10, discount: 8, rating: 4.5, ratingCount: 320, sales: 140 },
    { name: "اپل واچ SE", slug: "apple-watch-se", description: "ساعت هوشمند اپل با قیمت مناسب‌تر و امکانات کامل", price: 16500000, stock: 12, discount: 6, rating: 4.6, ratingCount: 890, sales: 310 },
    { name: "آمازفیت GTS4", slug: "amazfit-gts4", description: "ساعت هوشمند آمازفیت با صفحه AMOLED و GPS داخلی", price: 6800000, stock: 18, discount: 12, rating: 4.3, ratingCount: 450, sales: 260 },
    { name: "گلکسی واچ 5 پرو", slug: "galaxy-watch-5-pro", description: "ساعت هوشمند سامسونگ با بدنه تیتانیومی و باتری قوی", price: 19500000, stock: 8, discount: 9, rating: 4.6, ratingCount: 380, sales: 155 },
    { name: "ساعت هوشمند نویز کالرفیت", slug: "noise-colorfit", description: "ساعت هوشمند اقتصادی با نمایشگر رنگی بزرگ", price: 2900000, stock: 25, discount: 5, rating: 4.0, ratingCount: 210, sales: 180 },
    { name: "فیت‌بیت ورسا 4", slug: "fitbit-versa-4", description: "ساعت هوشمند فیت‌بیت با تمرکز بر سلامت و تناسب اندام", price: 9200000, stock: 14, discount: 7, rating: 4.4, ratingCount: 290, sales: 130 },
    { name: "اپل واچ اولترا 2", slug: "apple-watch-ultra-2", description: "ساعت هوشمند مقاوم اپل مناسب ورزش‌های سنگین و ماجراجویی", price: 34000000, stock: 4, discount: 0, rating: 4.8, ratingCount: 520, sales: 90 },
    { name: "ساعت هوشمند QCY", slug: "qcy-smartwatch", description: "ساعت هوشمند اقتصادی با باتری ۱۰ روزه", price: 1800000, stock: 35, discount: 15, rating: 3.9, ratingCount: 160, sales: 220 },
    { name: "گلکسی فیت 3", slug: "galaxy-fit-3", description: "مچ‌بند سبک سامسونگ برای پایش روزانه سلامت", price: 3400000, stock: 20, discount: 8, rating: 4.2, ratingCount: 240, sales: 175 },
    { name: "ساعت هوشمند بچگانه ردیو‌تک", slug: "kids-smartwatch", description: "ساعت هوشمند مخصوص کودکان با قابلیت تماس و ردیابی مکان", price: 3900000, stock: 22, discount: 0, rating: 4.1, ratingCount: 130, sales: 160 },
  ],
  audio: [
    { name: "ایرپادز 3", slug: "airpods-3", description: "هندزفری بی‌سیم اپل با صدای فضایی و شارژ سریع", price: 9800000, stock: 20, discount: 8, rating: 4.6, ratingCount: 1150, sales: 480 },
    { name: "اسپیکر بلوتوثی انکر ساندکور", slug: "anker-soundcore", description: "اسپیکر قابل حمل با صدای بم قوی و باتری ۲۴ ساعته", price: 3200000, stock: 25, discount: 10, rating: 4.4, ratingCount: 620, sales: 350 },
    { name: "هدفون بیتس استودیو پرو", slug: "beats-studio-pro", description: "هدفون روگوشی بیتس با نویزکنسلینگ فعال", price: 14500000, stock: 10, discount: 6, rating: 4.5, ratingCount: 340, sales: 140 },
    { name: "اسپیکر خانگی سونوس وان", slug: "sonos-one", description: "اسپیکر هوشمند خانگی با کیفیت صدای استودیویی", price: 12800000, stock: 8, discount: 0, rating: 4.7, ratingCount: 190, sales: 65 },
    { name: "ساندبار سامسونگ", slug: "soundbar-samsung", description: "ساندبار خانگی سامسونگ با صدای فراگیر ۵.۱ کانال", price: 15900000, stock: 6, discount: 12, rating: 4.5, ratingCount: 220, sales: 80 },
    { name: "هندزفری QCY T13", slug: "qcy-earbuds", description: "هندزفری بی‌سیم اقتصادی با کیفیت صدای مناسب", price: 980000, stock: 40, discount: 15, rating: 4.1, ratingCount: 890, sales: 620 },
    { name: "هدفون گیمینگ ریزر باراکودا", slug: "razer-barracuda", description: "هدست گیمینگ بی‌سیم با میکروفون قابل جدا شدن", price: 8900000, stock: 12, discount: 5, rating: 4.4, ratingCount: 260, sales: 120 },
    { name: "اسپیکر بلوتوث مارشال امبرتون", slug: "marshall-emberton", description: "اسپیکر قابل حمل مارشال با طراحی کلاسیک", price: 6800000, stock: 15, discount: 8, rating: 4.6, ratingCount: 410, sales: 190 },
    { name: "هدفون سونی WH-CH720N", slug: "sony-wh-ch720n", description: "هدفون سونی با نویزکنسلینگ و وزن سبک", price: 7200000, stock: 14, discount: 10, rating: 4.4, ratingCount: 280, sales: 150 },
    { name: "تلویزیون ال‌جی ۶۵ اینچ", slug: "tv-lg-65", description: "تلویزیون هوشمند ال‌جی با کیفیت ۴K و پنل OLED", price: 92000000, stock: 4, discount: 14, rating: 4.7, ratingCount: 180, sales: 55 },
  ],
  gpu: [
    { name: "کارت گرافیک RTX 4080", slug: "rtx-4080", description: "کارت گرافیک انویدیا برای گیمینگ ۴K و رندرینگ حرفه‌ای", price: 145000000, stock: 3, discount: 0, rating: 4.8, ratingCount: 95, sales: 20 },
    { name: "کارت گرافیک RTX 4090", slug: "rtx-4090", description: "قدرتمندترین کارت گرافیک انویدیا برای گیمینگ و هوش مصنوعی", price: 210000000, stock: 2, discount: 0, rating: 4.9, ratingCount: 60, sales: 12 },
    { name: "کارت گرافیک RX 7600", slug: "rx-7600", description: "کارت گرافیک اقتصادی ای‌ام‌دی برای گیمینگ فول‌اچ‌دی", price: 42000000, stock: 8, discount: 6, rating: 4.3, ratingCount: 130, sales: 70 },
    { name: "کارت گرافیک RX 7800 XT", slug: "rx-7800xt", description: "کارت گرافیک ای‌ام‌دی مناسب گیمینگ ۱۴۴۰p", price: 78000000, stock: 5, discount: 5, rating: 4.5, ratingCount: 160, sales: 55 },
    { name: "کارت گرافیک GTX 1650", slug: "gtx-1650", description: "کارت گرافیک اقتصادی مناسب گیمینگ سبک و کارهای عمومی", price: 21000000, stock: 12, discount: 8, rating: 4.1, ratingCount: 240, sales: 180 },
    { name: "کارت گرافیک RTX 3060", slug: "rtx-3060", description: "کارت گرافیک محبوب انویدیا برای گیمینگ فول‌اچ‌دی و کوهیک‌دی", price: 48000000, stock: 7, discount: 4, rating: 4.5, ratingCount: 310, sales: 145 },
    { name: "کارت گرافیک RTX 4060 Ti", slug: "rtx-4060-ti", description: "کارت گرافیک انویدیا با حافظه ۱۶ گیگابایت", price: 68000000, stock: 6, discount: 3, rating: 4.6, ratingCount: 190, sales: 90 },
    { name: "کارت گرافیک اینتل آرک A750", slug: "intel-arc-a750", description: "کارت گرافیک اینتل با قیمت رقابتی برای گیمینگ فول‌اچ‌دی", price: 32000000, stock: 9, discount: 10, rating: 4.0, ratingCount: 110, sales: 65 },
    { name: "کارت گرافیک RTX 3050", slug: "rtx-3050", description: "کارت گرافیک اقتصادی انویدیا برای شروع گیمینگ", price: 26000000, stock: 11, discount: 7, rating: 4.2, ratingCount: 200, sales: 130 },
  ],
  "gold-silver": [
    { name: "سکه نیم بهار آزادی", slug: "half-gold-coin", description: "سکه نیم‌بهار آزادی با عیار ۹۰۰ و کد اصالت", price: 125000000, stock: 8, discount: 0, rating: 4.8, ratingCount: 180, sales: 30 },
    { name: "سکه ربع بهار آزادی", slug: "quarter-gold-coin", description: "سکه ربع‌بهار آزادی ضرب بانک مرکزی", price: 65000000, stock: 12, discount: 0, rating: 4.8, ratingCount: 210, sales: 40 },
    { name: "شمش طلا نیم گرمی", slug: "gold-bar-half-g", description: "شمش طلای نیم گرمی با گواهی اصالت", price: 4700000, stock: 20, discount: 0, rating: 4.7, ratingCount: 150, sales: 55 },
    { name: "گوشواره طلا", slug: "gold-earrings", description: "گوشواره طلا با وزن تقریبی ۲ گرم، عیار ۷۵۰", price: 9800000, stock: 10, discount: 5, rating: 4.6, ratingCount: 95, sales: 25 },
    { name: "النگو طلا", slug: "gold-bangle", description: "النگوی طلا با طرح ساده و عیار ۷۵۰", price: 18500000, stock: 6, discount: 0, rating: 4.7, ratingCount: 70, sales: 15 },
    { name: "ست نقره زنانه", slug: "silver-set-women", description: "ست گردنبند و گوشواره نقره ۹۲۵ با نگین زیرکونیا", price: 4200000, stock: 15, discount: 8, rating: 4.4, ratingCount: 120, sales: 50 },
    { name: "انگشتر نقره مردانه", slug: "silver-ring-men", description: "انگشتر نقره مردانه با نگین عقیق", price: 2800000, stock: 18, discount: 6, rating: 4.5, ratingCount: 140, sales: 60 },
    { name: "زنجیر طلا مردانه", slug: "gold-chain-men", description: "زنجیر طلای مردانه با وزن تقریبی ۸ گرم", price: 38000000, stock: 4, discount: 0, rating: 4.6, ratingCount: 55, sales: 12 },
    { name: "سکه پارسیان", slug: "parsian-coin", description: "سکه یادبود پارسیان با عیار ۹۰۰ و بسته‌بندی مخصوص", price: 15800000, stock: 9, discount: 0, rating: 4.5, ratingCount: 40, sales: 10 },
  ],
  supermarket: [
    { name: "برنج طارم هاشمی", slug: "rice-tarom", description: "برنج طارم هاشمی درجه یک، کیسه ۱۰ کیلویی", price: 3400000, stock: 40, discount: 5, rating: 4.7, ratingCount: 1600, sales: 950 },
    { name: "روغن آفتابگردان لادن", slug: "sunflower-oil-ladan", description: "روغن مایع آفتابگردان لادن ۱.۸ لیتری", price: 420000, stock: 60, discount: 0, rating: 4.4, ratingCount: 890, sales: 620 },
    { name: "عسل طبیعی چهل‌گیاه", slug: "honey-chehelgiah", description: "عسل طبیعی چهل‌گیاه، ظرف ۹۰۰ گرمی", price: 680000, stock: 25, discount: 8, rating: 4.8, ratingCount: 420, sales: 280 },
    { name: "کره حیوانی کاله", slug: "butter-kalleh", description: "کره حیوانی کاله ۱۰۰ گرمی", price: 145000, stock: 80, discount: 0, rating: 4.5, ratingCount: 1200, sales: 900 },
    { name: "تخم‌مرغ محلی", slug: "eggs-local", description: "تخم‌مرغ محلی ارگانیک، بسته ۳۰ عددی", price: 320000, stock: 50, discount: 0, rating: 4.6, ratingCount: 780, sales: 540 },
    { name: "نوشابه زمزم", slug: "drink-zamzam", description: "نوشابه گازدار زمزم، بسته ۶ عددی", price: 180000, stock: 100, discount: 10, rating: 4.2, ratingCount: 950, sales: 1100 },
    { name: "رب گوجه فرنگی", slug: "tomato-paste", description: "رب گوجه فرنگی خالص، قوطی ۸۰۰ گرمی", price: 195000, stock: 70, discount: 0, rating: 4.4, ratingCount: 640, sales: 480 },
    { name: "آرد گندم سبوس‌دار", slug: "whole-wheat-flour", description: "آرد گندم سبوس‌دار، کیسه ۵ کیلویی", price: 280000, stock: 45, discount: 5, rating: 4.3, ratingCount: 310, sales: 210 },
  ],
  clothing: [
    { name: "کفش رسمی چرم مردانه", slug: "leather-dress-shoes", description: "کفش رسمی چرم طبیعی مردانه، مناسب مجالس و اداره", price: 4800000, stock: 15, discount: 8, rating: 4.5, ratingCount: 260, sales: 130 },
    { name: "کت اسپرت مردانه", slug: "blazer-casual", description: "کت اسپرت مردانه با پارچه ضدچروک", price: 3900000, stock: 10, discount: 5, rating: 4.3, ratingCount: 140, sales: 70 },
    { name: "مانتو اسپرت زنانه", slug: "manteau-sport", description: "مانتو اسپرت زنانه با پارچه نخی و طرح ساده", price: 1650000, stock: 22, discount: 10, rating: 4.4, ratingCount: 310, sales: 190 },
    { name: "کاپشن زمستانه زنانه", slug: "womens-winter-coat", description: "کاپشن زمستانه زنانه با پرداخت داخل پر و کلاه‌دار", price: 3200000, stock: 12, discount: 12, rating: 4.6, ratingCount: 220, sales: 105 },
  ],
  fashion: [
    { name: "کیف دستی زنانه چرم", slug: "leather-handbag-women", description: "کیف دستی زنانه از چرم طبیعی با طراحی مدرن", price: 2900000, stock: 14, discount: 8, rating: 4.6, ratingCount: 320, sales: 165 },
    { name: "عینک آفتابی ری‌بن", slug: "rayban-sunglasses", description: "عینک آفتابی کلاسیک ری‌بن با فریم فلزی", price: 4200000, stock: 10, discount: 5, rating: 4.7, ratingCount: 280, sales: 140 },
    { name: "کلاه کپ مردانه", slug: "cap-men", description: "کلاه کپ اسپرت مردانه، قابل تنظیم", price: 480000, stock: 40, discount: 0, rating: 4.2, ratingCount: 190, sales: 220 },
    { name: "شال و روسری ابریشمی", slug: "silk-scarf", description: "شال ابریشمی زنانه با طرح‌های رنگارنگ", price: 890000, stock: 25, discount: 10, rating: 4.5, ratingCount: 240, sales: 180 },
    { name: "کمربند چرم مردانه", slug: "leather-belt-men", description: "کمربند چرم طبیعی مردانه با سگک فلزی", price: 780000, stock: 30, discount: 6, rating: 4.4, ratingCount: 210, sales: 165 },
    { name: "ساعت مچی زنانه رمانتیک", slug: "watch-women-romantic", description: "ساعت مچی زنانه با بند استیل و طراحی ظریف", price: 2400000, stock: 16, discount: 9, rating: 4.5, ratingCount: 260, sales: 130 },
    { name: "کیف پول چرم", slug: "leather-wallet", description: "کیف پول چرم طبیعی مردانه با جای کارت متعدد", price: 620000, stock: 35, discount: 5, rating: 4.3, ratingCount: 340, sales: 250 },
    { name: "پیراهن مجلسی زنانه", slug: "evening-dress-women", description: "پیراهن مجلسی زنانه با پارچه ساتن و طراحی شیک", price: 2800000, stock: 8, discount: 0, rating: 4.6, ratingCount: 110, sales: 45 },
    { name: "جوراب ساق‌بلند ورزشی", slug: "sport-socks", description: "بسته ۳ عددی جوراب ورزشی نخی ساق‌بلند", price: 260000, stock: 60, discount: 0, rating: 4.1, ratingCount: 180, sales: 310 },
  ],
  tools: [
    { name: "پیچ‌گوشتی شارژی بوش", slug: "screwdriver-bosch", description: "پیچ‌گوشتی شارژی بوش با ۱۲ سری بیت همراه", price: 3200000, stock: 20, discount: 8, rating: 4.5, ratingCount: 230, sales: 150 },
    { name: "اره‌برقی ماکیتا", slug: "jigsaw-makita", description: "اره‌برقی مویر ماکیتا مناسب برش چوب و فلز نازک", price: 4800000, stock: 10, discount: 5, rating: 4.6, ratingCount: 140, sales: 65 },
    { name: "متر لیزری بوش", slug: "laser-meter-bosch", description: "متر لیزری بوش با دقت اندازه‌گیری میلی‌متری تا ۴۰ متر", price: 2900000, stock: 15, discount: 0, rating: 4.7, ratingCount: 190, sales: 90 },
    { name: "کمپرسور باد خانگی", slug: "air-compressor-home", description: "کمپرسور باد خانگی مناسب باد لاستیک و کارهای سبک", price: 5600000, stock: 8, discount: 10, rating: 4.3, ratingCount: 110, sales: 55 },
    { name: "جعبه‌ابزار چرخدار", slug: "rolling-toolbox", description: "جعبه‌ابزار چرخدار بزرگ با چند طبقه قابل جداشدن", price: 3800000, stock: 12, discount: 6, rating: 4.4, ratingCount: 160, sales: 75 },
    { name: "دریل بتن‌کن", slug: "hammer-drill", description: "دریل بتن‌کن قدرتمند مناسب کارهای عمرانی", price: 6900000, stock: 7, discount: 0, rating: 4.5, ratingCount: 95, sales: 40 },
    { name: "فرز مینی شارژی", slug: "mini-grinder", description: "فرز مینی شارژی مناسب کارهای دقیق و ظریف‌کاری", price: 2400000, stock: 18, discount: 12, rating: 4.2, ratingCount: 130, sales: 100 },
    { name: "تراز لیزری", slug: "laser-level", description: "تراز لیزری خودتنظیم برای نصب و ساخت‌وساز", price: 3400000, stock: 11, discount: 5, rating: 4.4, ratingCount: 105, sales: 60 },
    { name: "تفنگ چسب حرارتی", slug: "glue-gun", description: "تفنگ چسب حرارتی مناسب کارهای دستی و تعمیرات جزئی", price: 680000, stock: 30, discount: 0, rating: 4.1, ratingCount: 220, sales: 190 },
  ],
  home: [
    { name: "یخچال ساید بای ساید ال‌جی", slug: "fridge-lg-sbs", description: "یخچال فریزر ساید بای ساید ال‌جی با یخ‌ساز اتوماتیک", price: 145000000, stock: 3, discount: 0, rating: 4.7, ratingCount: 210, sales: 35 },
    { name: "ماشین لباسشویی سامسونگ", slug: "washer-samsung", description: "ماشین لباسشویی سامسونگ ۸ کیلویی با موتور اینورتر", price: 68000000, stock: 5, discount: 8, rating: 4.6, ratingCount: 320, sales: 80 },
    { name: "اتو بخار فیلیپس", slug: "steam-iron-philips", description: "اتو بخار فیلیپس با کف سرامیکی و بخار قوی", price: 3200000, stock: 20, discount: 10, rating: 4.4, ratingCount: 380, sales: 210 },
    { name: "سرخ‌کن بدون روغن پارس‌خزر", slug: "airfryer-parskhazar", description: "سرخ‌کن بدون روغن پارس‌خزر با ظرفیت ۴.۵ لیتر", price: 4800000, stock: 15, discount: 12, rating: 4.5, ratingCount: 460, sales: 290 },
    { name: "کتری برقی بوش", slug: "kettle-bosch", description: "کتری برقی بوش با قطع خودکار و بدنه استیل", price: 1900000, stock: 25, discount: 6, rating: 4.3, ratingCount: 290, sales: 220 },
    { name: "جارو شارژی بی‌سیم شیائومی", slug: "cordless-vacuum-xiaomi", description: "جارو شارژی بی‌سیم شیائومی با مکش قوی و باتری قابل تعویض", price: 8900000, stock: 12, discount: 9, rating: 4.5, ratingCount: 340, sales: 165 },
  ],
  beauty: [
    { name: "کرم مرطوب‌کننده نیوآ", slug: "nivea-moisturizer", description: "کرم مرطوب‌کننده نیوآ مناسب پوست‌های خشک و معمولی", price: 320000, stock: 40, discount: 5, rating: 4.4, ratingCount: 620, sales: 480 },
    { name: "ریمل حجم‌دهنده لورآل", slug: "loreal-mascara", description: "ریمل حجم‌دهنده و مقاوم در برابر آب لورآل", price: 380000, stock: 35, discount: 0, rating: 4.5, ratingCount: 540, sales: 410 },
    { name: "اپیلاتور فیلیپس", slug: "epilator-philips", description: "اپیلاتور فیلیپس با سر قابل شستشو و کیت مراقبت", price: 3900000, stock: 12, discount: 8, rating: 4.3, ratingCount: 260, sales: 130 },
    { name: "اصلاح‌تراش برقی برائون", slug: "shaver-braun", description: "اصلاح‌تراش برقی برائون با تیغه‌های دقیق و شارژ سریع", price: 4200000, stock: 14, discount: 10, rating: 4.6, ratingCount: 340, sales: 190 },
    { name: "ست مراقبت پوست گارنیر", slug: "garnier-skincare-set", description: "ست مراقبت پوست گارنیر شامل شوینده و مرطوب‌کننده", price: 890000, stock: 20, discount: 6, rating: 4.4, ratingCount: 280, sales: 210 },
    { name: "عطر زنانه شنل", slug: "chanel-perfume-women", description: "ادکلن زنانه با رایحه گل و ماندگاری بالا", price: 5800000, stock: 8, discount: 0, rating: 4.7, ratingCount: 190, sales: 65 },
    { name: "برس حرارتی مو", slug: "hair-styler-brush", description: "برس حرارتی برای صاف و حالت‌دهی سریع موها", price: 1600000, stock: 18, discount: 12, rating: 4.2, ratingCount: 230, sales: 170 },
  ],
  sports: [
    { name: "دوچرخه کوهستان جاینت", slug: "giant-mountain-bike", description: "دوچرخه کوهستان جاینت با فریم آلومینیومی و ۲۱ دنده", price: 24000000, stock: 6, discount: 5, rating: 4.6, ratingCount: 150, sales: 55 },
    { name: "تردمیل خانگی", slug: "treadmill-home", description: "تردمیل خانگی تاشو با نمایشگر دیجیتال", price: 32000000, stock: 4, discount: 8, rating: 4.4, ratingCount: 110, sales: 35 },
    { name: "توپ فوتبال آدیداس", slug: "adidas-football", description: "توپ فوتبال استاندارد آدیداس سایز ۵", price: 980000, stock: 40, discount: 0, rating: 4.5, ratingCount: 320, sales: 280 },
    { name: "کوله‌پشتی کوهنوردی", slug: "hiking-backpack", description: "کوله‌پشتی کوهنوردی ۵۰ لیتری ضدآب", price: 2800000, stock: 18, discount: 10, rating: 4.5, ratingCount: 210, sales: 140 },
    { name: "کفش کوهنوردی سالومون", slug: "salomon-hiking-shoes", description: "کفش کوهنوردی سالومون با کفی ضدلغزش", price: 6200000, stock: 10, discount: 6, rating: 4.7, ratingCount: 180, sales: 90 },
    { name: "تشک یوگا", slug: "yoga-mat", description: "تشک یوگا ضدلغزش با ضخامت ۶ میلی‌متر", price: 680000, stock: 35, discount: 0, rating: 4.3, ratingCount: 290, sales: 260 },
    { name: "کش ورزشی مقاومتی", slug: "resistance-bands", description: "ست کش‌های مقاومتی برای تمرینات خانگی", price: 480000, stock: 45, discount: 8, rating: 4.2, ratingCount: 240, sales: 300 },
    { name: "کیسه بوکس", slug: "punching-bag", description: "کیسه بوکس آویز با پرشدگی فوم متراکم", price: 3400000, stock: 9, discount: 5, rating: 4.4, ratingCount: 130, sales: 60 },
    { name: "عینک شنا اسپیدو", slug: "speedo-goggles", description: "عینک شنا اسپیدو ضدبخار و ضدآب", price: 620000, stock: 30, discount: 0, rating: 4.3, ratingCount: 190, sales: 175 },
    { name: "چراغ‌قوه کمپینگ", slug: "camping-lantern", description: "چراغ‌قوه کمپینگ شارژی با نور LED قوی", price: 890000, stock: 25, discount: 10, rating: 4.4, ratingCount: 160, sales: 130 },
    { name: "کیسه خواب کمپینگ", slug: "sleeping-bag", description: "کیسه خواب کمپینگ مناسب هوای سرد تا ۵- درجه", price: 1900000, stock: 15, discount: 6, rating: 4.5, ratingCount: 145, sales: 95 },
  ],
  "computer-accessories": [
    { name: "هارد اکسترنال سیگیت ۱ ترابایت", slug: "seagate-hdd-1tb", description: "هارد اکسترنال سیگیت با پورت USB 3.0 و طراحی جمع‌وجور", price: 2900000, stock: 25, discount: 8, rating: 4.5, ratingCount: 340, sales: 220 },
    { name: "فلش مموری سن‌دیسک ۶۴ گیگ", slug: "sandisk-flash-64gb", description: "فلش مموری سن‌دیسک با سرعت انتقال بالا", price: 480000, stock: 60, discount: 5, rating: 4.4, ratingCount: 620, sales: 510 },
    { name: "هاب یو‌اس‌بی ۴ پورت", slug: "usb-hub-4port", description: "هاب یو‌اس‌بی ۴ پورت با طراحی فشرده", price: 380000, stock: 45, discount: 0, rating: 4.2, ratingCount: 280, sales: 240 },
    { name: "پایه خنک‌کننده لپ‌تاپ", slug: "laptop-cooling-pad", description: "پایه خنک‌کننده لپ‌تاپ با دو فن بی‌صدا", price: 890000, stock: 30, discount: 10, rating: 4.3, ratingCount: 240, sales: 190 },
    { name: "کیبورد مکانیکال لاجیتک", slug: "logitech-mechanical-keyboard", description: "کیبورد مکانیکال لاجیتک با نور RGB و سوییچ‌های قابل تعویض", price: 4200000, stock: 12, discount: 6, rating: 4.6, ratingCount: 310, sales: 150 },
    { name: "ماوس بی‌سیم مایکروسافت", slug: "microsoft-wireless-mouse", description: "ماوس بی‌سیم مایکروسافت با طراحی ارگونومیک", price: 1200000, stock: 28, discount: 5, rating: 4.3, ratingCount: 260, sales: 210 },
    { name: "اسپیکر رومیزی کامپیوتر", slug: "desktop-speakers", description: "اسپیکر رومیزی دوتایی با صدای واضح و باس مناسب", price: 1600000, stock: 20, discount: 8, rating: 4.1, ratingCount: 190, sales: 145 },
    { name: "میکروفون یو‌اس‌بی بلو یتی", slug: "blue-yeti-mic", description: "میکروفون یو‌اس‌بی حرفه‌ای مناسب پادکست و استریم", price: 8900000, stock: 8, discount: 0, rating: 4.7, ratingCount: 150, sales: 55 },
    { name: "مانیتور ۲۴ اینچ ایسوس", slug: "asus-monitor-24", description: "مانیتور ۲۴ اینچ ایسوس با نرخ تازه‌سازی ۱۰۰ هرتز", price: 8500000, stock: 10, discount: 7, rating: 4.5, ratingCount: 220, sales: 105 },
  ],
};

async function mergeCategoryPairs() {
  for (const { from, into } of CATEGORY_MERGES) {
    const source = await prisma.category.findUnique({ where: { slug: from } });
    const target = await prisma.category.findUnique({ where: { slug: into } });
    if (!source) {
      console.log(`↪️  دسته «${from}» وجود ندارد، رد شد`);
      continue;
    }
    if (!target) {
      console.log(`⚠️  دسته مقصد «${into}» پیدا نشد، رد شد`);
      continue;
    }
    const moved = await prisma.product.updateMany({
      where: { categoryId: source.id },
      data: { categoryId: target.id },
    });
    await prisma.category.delete({ where: { id: source.id } });
    console.log(`🔀 ادغام شد: ${moved.count} محصول از «${from}» به «${into}» منتقل شد و دسته «${from}» حذف شد`);
  }
}

async function addNewProducts() {
  for (const [categorySlug, products] of Object.entries(NEW_PRODUCTS_BY_CATEGORY)) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      console.log(`⚠️  دسته «${categorySlug}» پیدا نشد، محصولاتش رد شدند`);
      continue;
    }
    for (const p of products) {
      const { slug, discount, sales, ...data } = p;
      await prisma.product.upsert({
        where: { slug },
        update: { ...data, discountPercent: discount, salesCount: sales, categoryId: category.id },
        create: { ...data, discountPercent: discount, salesCount: sales, slug, categoryId: category.id },
      });
    }
    console.log(`✅ ${categorySlug}: ${products.length} محصول جدید اضافه/به‌روزرسانی شد`);
  }
}

async function main() {
  await mergeCategoryPairs();
  await addNewProducts();
  const total = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  console.log(`\n🎉 تمام شد. مجموع محصولات: ${total} | مجموع دسته‌بندی‌ها: ${totalCategories}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "@/lib/prisma";
import { faNormalize } from "@/lib/normalize";
import { searchProducts } from "@/lib/search";
import { formatPrice } from "@/lib/format";

export type BotResponse = {
  text: string;
  products?: { name: string; slug: string; price: number; discountPercent: number; imageUrl: string | null }[];
  order?: { id: number; status: string; total: number; receiverName: string; createdAt: string } | null;
  askOrderId?: boolean;
  links?: { label: string; href: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار پرداخت",
  processing: "در حال آماده‌سازی",
  shipped: "تحویل به پست",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

// پاسخ‌های ثابت برای موضوعات عمومی
const GENERAL_ANSWERS: { keywords: string[]; answer: string; links?: BotResponse["links"] }[] = [
  {
    keywords: ["ارسال", "تحویل", "پست", "تیپاکس", "گنجه"],
    answer:
      "ارسال سفارش‌ها با سه روش انجام می‌شه: پست پیشتاز (۲ تا ۳ روز)، تیپاکس (۱ تا ۲ روز) و پیک گنجه در تهران (همان روز). بعد از انتخاب روش، می‌تونی روز تحویل و بازه زمانی (صبح یا عصر) رو هم خودت انتخاب کنی.",
    links: [{ label: "رویه‌های ارسال", href: "/shipping" }],
  },
  {
    keywords: ["بازگشت", "مرجوع", "پس‌داد"],
    answer:
      "تا ۷ روز بعد از تحویل، اگه از خریدت راضی نبودی می‌تونی کالا رو مرجوع کنی. کالا باید بدون استفاده و با بسته‌بندی اصلی باشه. کالاهای دسته سلامت و بهداشت به دلایل بهداشتی قابل مرجوعی نیستن.",
    links: [{ label: "رویه‌های بازگرداندن", href: "/returns" }],
  },
  {
    keywords: ["پرداخت", "پول", "درگاه", "کارت", "کسر", "پرداخت در محل"],
    answer:
      "در حال حاضر زیرساخت‌های پرداخت آنلاین فعال نیستن و پرداخت صرفاً به‌صورت آزمایشی نمایش داده می‌شه. گزینه «پرداخت در محل» هم در بعضی شهرها فعاله.",
    links: [{ label: "شیوه‌های پرداخت", href: "/payment" }],
  },
  {
    keywords: ["گارانتی", "ضمانت", "اصالت", "اورجینال", "واقعی"],
    answer:
      "تمام کالاهای دیجی‌کلون اصل و دارای گارانتی معتبر هستن. برگه گارانتی داخل جعبه محصول قرار داره و شامل خدمات گارانتی ۱۸ ماهه برای کالاهای دیجیتال هست.",
  },
  {
    keywords: ["ثبت‌نام", "ورود", "رمز", "پروفایل", "اکانت", "حساب کاربری"],
    answer:
      "برای ثبت‌نام فقط به یک شماره موبایل معتبر نیاز داری. با ورود به حساب می‌تونی سفارشاتت رو پیگیری کنی، آدرس‌هات رو مدیریت کنی و از تخفیف‌های ویژه اعضا استفاده کنی.",
    links: [{ label: "ورود / ثبت‌نام", href: "/login" }],
  },
  {
    keywords: ["امتیاز", "دیجی‌کوین", "مگنت", "اعتبار", "کیف پول"],
    answer:
      "با هر خرید، امتیاز مگنت و دیجی‌کوین دریافت می‌کنی که می‌تونی ازشون برای خریدهای بعدی استفاده کنی. موجودی کیف‌پولت رو تو صفحه «حساب کاربری» ببین.",
    links: [{ label: "حساب کاربری", href: "/profile" }],
  },
  {
    keywords: ["تماس", "تلفن", "شماره", "پیگیری شکایت", "ساعت کاری"],
    answer:
      "برای تماس مستقیم: ۰۲۱-۹۱۰۰۱۰۰۰ (شنبه تا پنجشنبه، ۹ صبح تا ۹ شب). می‌تونی از طریق صفحه «تماس با ما» هم پیام بدی.",
    links: [{ label: "تماس با ما", href: "/contact" }],
  },
  {
    keywords: ["ساعت", "زمان تحویل", "کجا", "شعبه", "آدرس فروشگاه"],
    answer:
      "فروشگاه ما فقط به‌صورت آنلاین فعالیت می‌کنه و شعبه حضوری نداره. ارسال‌ها از انبار تهران انجام می‌شه.",
  },
];

// دسته‌بندی‌هایی که ربات می‌تونه برای جستجوی محصول تشخیص بده
const CATEGORY_QUERIES: { keywords: string[]; query: string; title: string; category?: string }[] = [
  { keywords: ["موبایل", "گوشی", "آیفون", "سامسونگ", "شیائومی", "هوآوی"], query: "", title: "موبایل", category: "mobile" },
  { keywords: ["لپ‌تاپ", "مک‌بوک", "ایسوس", "لنوو", "ایسر", "دفتر"], query: "", title: "لپ‌تاپ", category: "laptop" },
  { keywords: ["هدفون", "ایرپاد", "اسپیکر", "هندزفری", "جی‌بی‌ال", "سونی"], query: "", title: "صوتی و هدفون", category: "audio" },
  { keywords: ["ساعت", "واچ", "اپل واچ", "گلکسی واچ"], query: "", title: "ساعت هوشمند", category: "smartwatch" },
  { keywords: ["تبلت", "آیپد", "گلکسی تب"], query: "", title: "تبلت", category: "tablet" },
  { keywords: ["کفش", "پوشاک", "لباس", "تیشرت", "هودی", "شلوار", "نایک", "آدیداس"], query: "", title: "پوشاک", category: "clothing" },
  { keywords: ["کارت گرافیک", "گرافیک", "گیمینگ", "کنسول", "پلی‌استیشن", "مادربرد", "پلی استیشن", "کامپیوتر"], query: "", title: "قطعات و گیمینگ", category: "gpu" },
  { keywords: ["عطر", "ادکلن", "بادی اسپلش"], query: "", title: "عطر و ادکلن", category: "perfume" },
  { keywords: ["کتاب", "رمان", "دفتر"], query: "", title: "کتاب و لوازم تحریر", category: "books" },
  { keywords: ["اسباب‌بازی", "لگو", "عروسک", "پازل"], query: "", title: "اسباب‌بازی", category: "toys" },
  { keywords: ["پلوپز", "کتری", "مایکروویو", "جارو", "سشوار", "لباسشویی", "یخچال", "لوازم خانگی"], query: "", title: "لوازم خانگی", category: "home-appliances" },
  { keywords: ["طلا", "نقره", "سکه", "شمش"], query: "", title: "طلا و نقره", category: "gold-silver" },
  { keywords: ["ماشین لباسشویی"], query: "ماشین لباسشویی", title: "ماشین لباسشویی" },
  { keywords: ["پلوپز"], query: "پلوپز", title: "پلوپز" },
];

// کلمات پرکننده که در عبارت جستجو بی‌معنی هستن
const FILLER_WORDS = [
  "میخوام", "می‌خوام", "می‌خوایم", "دارید", "دارین", "داره", "هست", "هستن", "یه", "یک", "یکی",
  "بخر", "بخرم", "می‌شه", "میشه", "چیه", "چیست", "لطفا", "لطفاً", "بهترین", "خوب", "خوبه", "عالی",
  "بده", "پیشنهاد", "کن", "بفرست", "نشون", "بگو", "ببین", "دنبال", "دنبالشم", "دنبالش", "برای", "من",
  "توی", "تو", "در", "و", "با", "از", "را", "رو", "می", "بدم", "بم", "برام", "بهم", "یه", "یه‌چیز",
];

export async function lookupOrderById(id: number): Promise<BotResponse["order"]> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    total: order.total,
    receiverName: order.receiverName,
    createdAt: order.createdAt.toISOString(),
  };
}

export async function handleBotMessage(message: string): Promise<BotResponse> {
  const q = faNormalize(message);

  // ۱) اگر پیام فقط یک عدد است (شماره سفارش) — صرف‌نظر از تعداد ارقام
  const digitsOnly = q.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[^0-9]/g, "");
  const isOnlyDigits = digitsOnly.length > 0 && digitsOnly.length === q.length;
  if (isOnlyDigits && digitsOnly.length <= 6) {
    const id = Number(digitsOnly);
    const order = await lookupOrderById(id);
    if (!order) {
      return {
        text: `سفارشی با شماره ${id.toLocaleString("fa-IR")} پیدا نکردم. مطمئن شو عدد سفارش درست وارد شده یا سفارش رو از طریق صفحه «پیگیری سفارش» چک کن.`,
        links: [{ label: "پیگیری سفارش", href: "/track-order" }],
      };
    }
    return {
      text: `سفارش #${order.id.toLocaleString("fa-IR")} با موفقیت پیدا شد.\nوضعیت فعلی: ${STATUS_LABELS[order.status] ?? order.status}\nگیرنده: ${order.receiverName}\nمبلغ: ${formatPrice(order.total)}\nثبت شده در: ${new Date(order.createdAt).toLocaleDateString("fa-IR")}`,
      order,
    };
  }

  // ۲) پیگیری سفارش
  if (/(پیگیری|رهگیری|وضعیت سفارش|کد رهگیری|ردیابی|سفارشم کجاست|سفارش رو).*/.test(q)) {
    return {
      text: "بریم سفارشت رو پیگیری کنیم! عدد سفارش رو برام بفرست (مثلاً ۱۲۳۴۵).",
      askOrderId: true,
      links: [{ label: "صفحه پیگیری سفارش", href: "/track-order" }],
    };
  }

  // ۳) تخفیف‌ها — محصولات واقعی دارای تخفیف
  if (/(تخفیف|حراج|جشنواره|کد تخفیف|کوپن|شگفت‌انگیز|ویژه|ارزون|ارزان)/.test(q)) {
    const deals = await prisma.product.findMany({
      where: { discountPercent: { gt: 0 } },
      orderBy: { discountPercent: "desc" },
      take: 6,
    });
    if (deals.length > 0) {
      return {
        text: `در حال حاظر ${deals.length} محصول با تخفیف ویژه داریم. چند تا از بهترینشون:` + (q.includes("کد تخفیف") ? "\n\nنکته: برای اعمال کد تخفیف، کد رو در مرحله تسویه حساب در کادر مخصوص وارد کن." : ""),
        products: deals.map((p) => ({
          name: p.name,
          slug: p.slug,
          price: p.price,
          discountPercent: p.discountPercent,
          imageUrl: p.imageUrl,
        })),
        links: [{ label: "همه تخفیف‌ها", href: "/deals" }],
      };
    }
  }

  // ۴) پرفروش‌ترین‌ها
  if (/(پرفروش|محبوب|معروف|بهترین‌ها|بالاترین فروش|بیشترین فروش|فروش بالا)/.test(q) || /\b(top|best|popular)\b/.test(q)) {
    const best = await prisma.product.findMany({
      orderBy: { salesCount: "desc" },
      take: 5,
    });
    return {
      text: "این‌ها پرفروش‌ترین محصولات دیجی‌کلون هستن:",
      products: best.map((p) => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        discountPercent: p.discountPercent,
        imageUrl: p.imageUrl,
      })),
      links: [{ label: "مشاهده همه", href: "/bestsellers" }],
    };
  }

  // ۵) جستجوی محصول بر اساس دسته‌بندی یا عبارت آزاد
  for (const c of CATEGORY_QUERIES) {
    if (c.keywords.some((k) => q.includes(k))) {
      let products;
      if (c.category) {
        const cat = await prisma.category.findUnique({ where: { slug: c.category } });
        if (cat) {
          products = await prisma.product.findMany({
            where: { categoryId: cat.id },
            include: { category: true },
            orderBy: [{ discountPercent: "desc" }, { salesCount: "desc" }],
            take: 6,
          });
        }
      } else {
        products = await searchProducts(c.query || q, 6);
      }
      if (!products || products.length === 0) continue;
      return {
        text: `این‌ها چند محصول از دسته «${c.title}» هستن:`,
        products: products.map((p) => ({
          name: p.name,
          slug: p.slug,
          price: p.price,
          discountPercent: p.discountPercent,
          imageUrl: p.imageUrl,
        })),
      };
    }
  }

  // ۶) جستجوی آزاد: اگر کلمه‌ای غیر از پرکننده‌ها داشت
  const meaningfulTokens = q.split(" ").filter((t) => t.length >= 2 && !FILLER_WORDS.includes(t));
  if (meaningfulTokens.length > 0) {
    const query = meaningfulTokens.join(" ");
    const results = await searchProducts(query, 5);
    if (results.length > 0) {
      return {
        text: `برای «${query}» این نتایج رو پیدا کردم:`,
        products: results.map((p) => ({
          name: p.name,
          slug: p.slug,
          price: p.price,
          discountPercent: p.discountPercent,
          imageUrl: p.imageUrl,
        })),
      };
    }
  }

  // ۷) پاسخ‌های ثابت عمومی
  for (const item of GENERAL_ANSWERS) {
    if (item.keywords.some((k) => q.includes(k))) {
      return { text: item.answer, links: item.links };
    }
  }

  // ۸) احوال‌پرسی
  if (/(سلام|درود|hi|hello|علیک|صبح بخیر|عصر بخیر|شب بخیر)/.test(q)) {
    return {
      text: "سلام! به پشتیبانی آنلاین دیجی‌کلون خوش اومدی. چطور می‌تونم کمکت کنم؟ می‌تونی درباره ارسال، مرجوعی، پرداخت، گارانتی، پیگیری سفارش بپرسی یا اسم محصول موردنظرت رو بنویسی تا برات پیدا کنم.",
    };
  }

  // ۹) تشکر
  if (/(تشکر|ممنون|مرسی|دمت|خسته نباشی|ممنونم)/.test(q)) {
    return { text: "خواهش می‌کنم! اگه سوال دیگه‌ای داشتی همیشه در خدمتم. روز خوبی داشته باشی. 🌟" };
  }

  // ۱۰) پاسخ پیش‌فرض
  return {
    text: "سوالت رو کامل متوجه نشدم. می‌تونی از دکمه‌های سریع بالا استفاده کنی یا این موارد رو امتحان کن:\n• «پیگیری سفارشم»\n• «هدفون می‌خوام»\n• «تخفیف‌ها»\n• «پرفروش‌ترین‌ها»\n• «شرایط مرجوعی»\nاگه عجله داری با ۰۲۱-۹۱۰۰۱۰۰۰ تماس بگیر.",
  };
}

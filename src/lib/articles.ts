import { prisma } from "@/lib/prisma";

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  readTime: string;
  productSlugs: string[];
  content?: string;
  contentBlocks?: { type: "p" | "img" | "video"; text?: string; src?: string }[] | null;
};

export type ArticleInput = Omit<Article, "id"> & { id: string };

// داده اولیه (seed) — برای بار اول که جدول خالی است
export const SEED_ARTICLES: ArticleInput[] = [
  {
    id: "iphone-15-review",
    title: "بررسی کامل آیفون ۱۵؛ ارزش خرید دارد؟",
    excerpt:
      "با تراشه A16 و دوربین ۴۸ مگاپیکسلی، آیا آیفون ۱۵ انتخاب هوشمندانه‌ای است؟",
    category: "بررسی موبایل",
    date: "۱۴۰۳/۰۵/۱۲",
    image: "/images/articles/iphone-15.jpg",
    readTime: "۸ دقیقه",
    productSlugs: ["iphone-15"],
    content: [
      "آیفون ۱۵ با تراشه A16 Bionic و دوربین ۴۸ مگاپیکسلی، یکی از محبوب‌ترین گوشی‌های بازار در سال جاری است. در این بررسی نگاهی دقیق به طراحی، عملکرد و دوربین آن می‌اندازیم.",
      "طراحی: بدنه آلومینیومی با لبه‌های گرد، وزن حدود ۱۷۱ گرم و استاندارد IP68. صفحه‌نمایش ۶.۱ اینچی Super Retina XDR با نرخ تازه‌سازی ۶۰ هرتز، کیفیت رنگ عالی و روشنایی ۲۰۰۰ نیت دارد.",
      "عملکرد: تراشه A16 Bionic برای تمام کارهای روزمره و حتی بازی‌های سنگین بیش از اندازه قدرتمند است. iOS 17 نیز تجربه نرم و روانی ارائه می‌دهد.",
      "دوربین: دوربین اصلی ۴۸ مگاپیکسلی با ترکیب پیکسل‌ها عکس‌های ۱۲ مگاپیکسلی با جزئیات فوق‌العاده ثبت می‌کند. زوم اپتیکال ۲ برابر و حالت سینمایی نیز بهبود یافته است.",
      "جمع‌بندی: اگر به دنبال یک گوشی بالارده با دوربین عالی و پشتیبانی طولانی‌مدت هستید، آیفون ۱۵ انتخاب هوشمندانه‌ای است.",
    ].join("\n\n"),
  },
  {
    id: "m3-chip-guide",
    title: "راهنمای خرید مک‌بوک با تراشه M3",
    excerpt:
      "تفاوت تراشه‌های M3، M3 Pro و M3 Max در یک نگاه؛ کدام برای شما مناسب است؟",
    category: "راهنمای خرید",
    date: "۱۴۰۳/۰۵/۰۸",
    image: "/images/articles/macbook.svg",
    readTime: "۶ دقیقه",
    productSlugs: ["macbook-pro-m3", "macbook-air-m3"],
    content: [
      "تراشه‌های M3 اپل با معماری ۳ نانومتری، جهش بزرگی در کارایی و مصرف انرژی به همراه داشته‌اند. اما کدام نسخه برای شما مناسب است؟",
      "M3 پایه: مناسب دانشجویان، کارهای اداری و کدنویسی سبک. تا ۱۸ ساعت شارژدهی و عملکرد عالی برای مک‌بوک ایر.",
      "M3 Pro: با ۱۲ هسته پردازشی و پشتیبانی از حافظه بیشتر، برای ویرایش ویدئو، فتوشاپ و پروژه‌های سنگین برنامه‌نویسی عالی است.",
      "M3 Max: قدرتمندترین نسخه، مناسب حرفه‌ای‌های ویرایش ۸K و کارهای گرافیکی سنگین. فقط در مک‌بوک پرو ۱۶ اینچی عرضه می‌شود.",
      "نکته کلیدی: اگر مطمئن نیستید، نسخه پایه با ۱۶ گیگابایت رم شروع خوبی است و برای اکثر کاربران کافی خواهد بود.",
    ].join("\n\n"),
  },
  {
    id: "airpods-vs-sony",
    title: "ایرپادز پرو یا سونی XM5؟ مقایسه کامل",
    excerpt:
      "دو غول نویزکنسلینگ بازار مقابل هم؛ کدام یک سروصدای محیط را بهتر حذف می‌کند؟",
    category: "مقایسه",
    date: "۱۴۰۳/۰۵/۰۱",
    image: "/images/articles/airpods.svg",
    readTime: "۵ دقیقه",
    productSlugs: ["airpods-pro-2", "sony-wh1000xm5"],
    content: [
      "ایرپادز پرو ۲ و سونی WH-1000XM5 دو غول نویزکنسلینگ بازار هستند. مقایسه این دو می‌تواند تصمیم خرید را آسان‌تر کند.",
      "کیفیت صدا: سونی با درایورهای بزرگ‌تر، بیس عمیق‌تر و صدای فراگیرتری ارائه می‌دهد. ایرپادز پرو صدای متعادل و طبیعی‌تری دارد.",
      "نویزکنسلینگ: سونی XM5 در حذف نویز فرکانس پایین (مانند صدای مترو) برتری جزئی دارد، اما تفاوت آن‌قدر محسوس نیست.",
      "اتصال و اکوسیستم: ایرپادز با آیفون تجربه‌ای بی‌نظیر دارد؛ سونی با بلوتوث استاندارد روی تمام دستگاه‌ها عالی کار می‌کند.",
      "جمع‌بندی: کاربران آیفون ایرپادز پرو را انتخاب کنند؛ کاربران اندروید و علاقه‌مندان به صدای پرقدرت، سونی XM5 را.",
    ].join("\n\n"),
  },
  {
    id: "smartwatch-guide",
    title: "بهترین ساعت هوشمند برای هر سبک زندگی",
    excerpt:
      "از ورزشکار حرفه‌ای تا کاربر اداری؛ بر اساس نیازتان بهترین انتخاب را داشته باشید.",
    category: "راهنمای خرید",
    date: "۱۴۰۳/۰۴/۲۵",
    image: "/images/articles/watch.svg",
    readTime: "۷ دقیقه",
    productSlugs: ["galaxy-watch-6"],
    content: [
      "انتخاب ساعت هوشمند به سبک زندگی شما بستگی دارد. این راهنما به شما کمک می‌کند بهترین انتخاب را داشته باشید.",
      "ورزشکاران: اگر به دنبال سنجش دقیق ضربان قلب، GPS و برنامه‌های تمرینی هستید، اپل واچ سری ۹ و گلکسی واچ ۶ گزینه‌های برتر هستند.",
      "کاربران اداری: ساعت‌هایی با باتری بلندمدت و نمایشگر همیشه‌روشن، برای استفاده روزمره اداری ایده‌آل‌اند.",
      "کاربران اقتصادی: بندهای شیائومی با قیمت مناسب، امکانات پایه پایش فعالیت را ارائه می‌دهند.",
      "نکته مهم: قبل از خرید، سازگاری ساعت با گوشی خود (iOS یا اندروید) را حتماً بررسی کنید.",
    ].join("\n\n"),
  },
];

/** آیا جدول مقاله خالی است؟ (برای seed خودکار در اولین درخواست) */
export async function seedArticlesIfEmpty(): Promise<number> {
  const count = await prisma.article.count();
  if (count > 0) return 0;
  let inserted = 0;
  for (const a of SEED_ARTICLES) {
    await prisma.article.create({
      data: {
        id: a.id,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        date: a.date,
        image: a.image,
        readTime: a.readTime,
        productSlugs: a.productSlugs,
        content: a.content ?? "",
      },
    });
    inserted++;
  }
  return inserted;
}

export async function getArticles(): Promise<Article[]> {
  await seedArticlesIfEmpty();
  const rows = await prisma.article.findMany({
    where: { published: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    date: a.date,
    image: a.image,
    readTime: a.readTime,
    productSlugs: (a.productSlugs as string[]) ?? [],
    content: a.content,
    contentBlocks: a.contentBlocks as Article["contentBlocks"],
  }));
}

export async function getArticle(id: string): Promise<Article | null> {
  await seedArticlesIfEmpty();
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a || !a.published) return null;
  return {
    id: a.id,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    date: a.date,
    image: a.image,
    readTime: a.readTime,
    productSlugs: (a.productSlugs as string[]) ?? [],
    content: a.content,
    contentBlocks: a.contentBlocks as Article["contentBlocks"],
  };
}

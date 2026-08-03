export type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  readTime: string;
};

export const ARTICLES: Article[] = [
  {
    id: "iphone-15-review",
    title: "بررسی کامل آیفون ۱۵؛ ارزش خرید دارد؟",
    excerpt: "با تراشه A16 و دوربین ۴۸ مگاپیکسلی، آیا آیفون ۱۵ انتخاب هوشمندانه‌ای است؟",
    category: "بررسی موبایل",
    date: "۱۴۰۳/۰۵/۱۲",
    image: "/images/articles/iphone-15.svg",
    readTime: "۸ دقیقه",
  },
  {
    id: "m3-chip-guide",
    title: "راهنمای خرید مک‌بوک با تراشه M3",
    excerpt: "تفاوت تراشه‌های M3، M3 Pro و M3 Max در یک نگاه؛ کدام برای شما مناسب است؟",
    category: "راهنمای خرید",
    date: "۱۴۰۳/۰۵/۰۸",
    image: "/images/articles/macbook.svg",
    readTime: "۶ دقیقه",
  },
  {
    id: "airpods-vs-sony",
    title: "ایرپادز پرو یا سونی XM5؟ مقایسه کامل",
    excerpt: "دو غول نویزکنسلینگ بازار مقابل هم؛ کدام یک سروصدای محیط را بهتر حذف می‌کند؟",
    category: "مقایسه",
    date: "۱۴۰۳/۰۵/۰۱",
    image: "/images/articles/airpods.svg",
    readTime: "۵ دقیقه",
  },
  {
    id: "smartwatch-guide",
    title: "بهترین ساعت هوشمند برای هر سبک زندگی",
    excerpt: "از ورزشکار حرفه‌ای تا کاربر اداری؛ بر اساس نیازتان بهترین انتخاب را داشته باشید.",
    category: "راهنمای خرید",
    date: "۱۴۰۳/۰۴/۲۵",
    image: "/images/articles/watch.svg",
    readTime: "۷ دقیقه",
  },
];

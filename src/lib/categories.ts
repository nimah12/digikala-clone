import type { Category } from "@prisma/client";

// Categories pinned in the header menu; must exist in the DB (seeded).
export const MENU_CATEGORIES: Category[] = [
  { id: 0, name: "موبایل", slug: "mobile" },
  { id: 0, name: "لپ‌تاپ", slug: "laptop" },
  { id: 0, name: "تبلت", slug: "tablet" },
  { id: 0, name: "ساعت هوشمند", slug: "smartwatch" },
  { id: 0, name: "طلا و نقره", slug: "gold-silver" },
  { id: 0, name: "سوپرمارکت", slug: "supermarket" },
  { id: 0, name: "پوشاک", slug: "clothing" },
  { id: 0, name: "لباس و مد", slug: "fashion" },
  { id: 0, name: "ابزارآلات", slug: "tools" },
  { id: 0, name: "کارت گرافیک", slug: "gpu" },
] as unknown as Category[];

// Mega menu sections with subcategories (digikala-style)
export type MegaMenuSection = {
  slug: string;
  name: string;
  icon: string;
  subcategories: string[];
};

export const MEGA_MENU: MegaMenuSection[] = [
  {
    slug: "mobile",
    name: "موبایل",
    icon: "📱",
    subcategories: ["آیفون", "سامسونگ", "شیائومی", "گوگل پیکسل", "نوکیا"],
  },
  {
    slug: "laptop",
    name: "لپ‌تاپ",
    icon: "💻",
    subcategories: ["مک‌بوک", "لنوو", "ایسوس", "ایسر", "اچ‌پی"],
  },
  {
    slug: "tablet",
    name: "تبلت",
    icon: "📲",
    subcategories: ["آیپد", "گلکسی تب", "لنوو تب", "امازون کیندل"],
  },
  {
    slug: "smartwatch",
    name: "ساعت هوشمند",
    icon: "⌚",
    subcategories: ["اپل واچ", "گلکسی واچ", "شیائومی بند", "گارمین"],
  },
  {
    slug: "audio",
    name: "صوتی و تصویری",
    icon: "🎧",
    subcategories: ["هدفون", "اسپیکر بلوتوثی", "ساندبار", "تلویزیون"],
  },
  {
    slug: "gpu",
    name: "کارت گرافیک و گیمینگ",
    icon: "🎮",
    subcategories: ["ان‌ویدیا", "ای‌ام‌دی", "کیس گیمینگ", "مانیتور گیمینگ", "مادربرد"],
  },
  {
    slug: "gold-silver",
    name: "طلا و نقره",
    icon: "🥇",
    subcategories: ["سکه طلا", "شمش طلا", "انگشتر طلا", "نقره", "دستبند طلا"],
  },
  {
    slug: "supermarket",
    name: "سوپرمارکت",
    icon: "🛒",
    subcategories: ["مواد غذایی", "نوشیدنی", "لبنیات", "قهوه و چای", "تنقلات"],
  },
  {
    slug: "clothing",
    name: "پوشاک",
    icon: "🧥",
    subcategories: ["کفش اسپرت", "شلوار جین", "پیراهن", "هودی", "بادگیر"],
  },
  {
    slug: "fashion",
    name: "لباس و مد",
    icon: "👕",
    subcategories: ["مردانه", "زنانه", "کفش", "ساعت و اکسسوری", "بچگانه"],
  },
  {
    slug: "tools",
    name: "ابزارآلات",
    icon: "🔧",
    subcategories: ["برقی", "دستی", "نردبان", "جعبه ابزار", "خودرو"],
  },
  {
    slug: "home",
    name: "خانه و آشپزخانه",
    icon: "🏠",
    subcategories: ["لوازم آشپزخانه", "جاروبرقی", "یخچال", "ماشین لباسشویی"],
  },
  {
    slug: "beauty",
    name: "زیبایی و سلامت",
    icon: "💄",
    subcategories: ["لوازم آرایشی", "مراقبت پوست", "سشوار", "اصلاح"],
  },
  {
    slug: "sports",
    name: "ورزش و سفر",
    icon: "🏃",
    subcategories: ["لوازم ورزشی", "کیف مسافرتی", "چمدان", "لوازم کمپینگ"],
  },
];

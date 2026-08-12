import type { Category } from "@prisma/client";
import type { IconName } from "@/components/Icon";

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
  icon: IconName;
  subcategories: string[];
};

export const MEGA_MENU: MegaMenuSection[] = [
  {
    slug: "mobile",
    name: "موبایل",
    icon: "phone",
    subcategories: ["آیفون", "سامسونگ", "شیائومی", "آنر", "گوگل پیکسل"],
  },
  {
    slug: "laptop",
    name: "لپ‌تاپ",
    icon: "laptop",
    subcategories: ["لنوو", "ایسوس", "مک‌بوک", "اچ‌پی", "دل"],
  },
  {
    slug: "tablet",
    name: "تبلت",
    icon: "tablet",
    subcategories: ["آیپد", "گلکسی تب", "لنوو تب", "تبلت"],
  },
  {
    slug: "smartwatch",
    name: "ساعت هوشمند",
    icon: "watch",
    subcategories: ["اپل واچ", "گلکسی واچ", "ساعت هوشمند", "گارمین"],
  },
  {
    slug: "audio",
    name: "صوتی و تصویری",
    icon: "headphones",
    subcategories: ["هدفون", "اسپیکر", "تلویزیون", "ساندبار"],
  },
  {
    slug: "camera",
    name: "دوربین و تصویر",
    icon: "camera",
    subcategories: ["دوربین عکاسی", "اکشن‌کم", "دوربین مداربسته"],
  },
  {
    slug: "gpu",
    name: "کارت گرافیک و گیمینگ",
    icon: "gamepad",
    subcategories: ["کارت گرافیک", "مانیتور", "کنسول", "گیمینگ", "مادربرد"],
  },
  {
    slug: "computer-accessories",
    name: "لوازم جانبی کامپیوتر",
    icon: "monitor",
    subcategories: ["ماوس", "کیبورد", "گیمینگ", "فلش مموری", "هارد اکسترنال"],
  },
  {
    slug: "home-appliances",
    name: "لوازم خانگی",
    icon: "coffee",
    subcategories: ["اتو", "کتری", "سشوار", "پلوپز", "مایکروویو"],
  },
  {
    slug: "home",
    name: "خانه و آشپزخانه",
    icon: "home",
    subcategories: ["جارو", "مخلوط‌کن", "سرخ‌کن", "یخچال", "ماشین لباسشویی"],
  },
  {
    slug: "decor",
    name: "دکوراتیو",
    icon: "lamp",
    subcategories: ["گلدان", "شمع", "ساعت دیواری", "رومیزی", "آینه"],
  },
  {
    slug: "clothing",
    name: "پوشاک",
    icon: "shirt",
    subcategories: ["مردانه", "پیراهن", "شلوار", "کفش", "هودی"],
  },
  {
    slug: "fashion",
    name: "لباس و مد",
    icon: "t-shirt",
    subcategories: ["کفش", "آدیداس", "زنانه", "مردانه", "چرم"],
  },
  {
    slug: "beauty",
    name: "زیبایی و سلامت",
    icon: "spray",
    subcategories: ["عطر", "فیلیپس", "اصلاح", "مراقبت پوست", "مو"],
  },
  {
    slug: "perfume",
    name: "عطر و ادکلن",
    icon: "sparkles",
    subcategories: ["عطر مردانه", "عطر زنانه", "ادکلن", "یونیسکس"],
  },
  {
    slug: "sports",
    name: "ورزش و سفر",
    icon: "shoe",
    subcategories: ["کوله", "کمپینگ", "دوچرخه", "فوتبال", "یوگا"],
  },
  {
    slug: "books",
    name: "کتاب و لوازم تحریر",
    icon: "book",
    subcategories: ["داستان", "رمان", "کتاب", "هنر", "کودک"],
  },
  {
    slug: "toys",
    name: "اسباب‌بازی",
    icon: "gift",
    subcategories: ["لگو", "عروسک", "پازل", "ماشین کنترلی", "بازی"],
  },
  {
    slug: "supermarket",
    name: "سوپرمارکت",
    icon: "basket",
    subcategories: ["روغن", "چای", "قهوه", "شیر", "برنج"],
  },
  {
    slug: "gold-silver",
    name: "طلا و نقره",
    icon: "coins",
    subcategories: ["سکه", "شمش", "انگشتر", "نقره", "گردنبند"],
  },
  {
    slug: "tools",
    name: "ابزارآلات",
    icon: "wrench",
    subcategories: ["دریل", "پیچ‌گوشتی", "شارژی", "جعبه ابزار", "لیزری"],
  },
  {
    slug: "spare-parts",
    name: "لوازم یدکی",
    icon: "car",
    subcategories: ["ماشین", "موتور"],
  },
];

// Grouped mega menu (digikala-style): main group list on one side,
// subcategory panel on the other side.
export type MegaMenuGroup = {
  title: string;
  icon: IconName;
  items: MegaMenuSection[];
};

const bySlug = (slug: string): MegaMenuSection =>
  MEGA_MENU.find((s) => s.slug === slug) ?? MEGA_MENU[0];

export const MEGA_MENU_GROUPS: MegaMenuGroup[] = [
  {
    title: "کالای دیجیتال",
    icon: "phone",
    items: [
      bySlug("mobile"),
      bySlug("laptop"),
      bySlug("tablet"),
      bySlug("smartwatch"),
      bySlug("audio"),
      bySlug("camera"),
      bySlug("gpu"),
      bySlug("computer-accessories"),
    ],
  },
  {
    title: "خانه و آشپزخانه",
    icon: "home",
    items: [bySlug("home"), bySlug("home-appliances"), bySlug("decor")],
  },
  {
    title: "مد و پوشاک",
    icon: "t-shirt",
    items: [bySlug("clothing"), bySlug("fashion")],
  },
  {
    title: "زیبایی و سلامت",
    icon: "spray",
    items: [bySlug("beauty"), bySlug("perfume")],
  },
  {
    title: "ورزش و سفر",
    icon: "shoe",
    items: [bySlug("sports")],
  },
  {
    title: "کتاب و لوازم تحریر",
    icon: "book",
    items: [bySlug("books")],
  },
  {
    title: "مادر و کودک",
    icon: "gift",
    items: [bySlug("toys")],
  },
  {
    title: "سوپرمارکت",
    icon: "basket",
    items: [bySlug("supermarket")],
  },
  {
    title: "طلا و نقره",
    icon: "coins",
    items: [bySlug("gold-silver")],
  },
  {
    title: "ابزارآلات",
    icon: "wrench",
    items: [bySlug("tools")],
  },
  {
    title: "لوازم یدکی",
    icon: "car",
    items: [bySlug("spare-parts")],
  },
];

// Curated quick links shown in the sub-header bar (below the main header),
// digikala-style: important sections with a related icon.
export type SubHeaderLink = { label: string; icon: IconName; href: string };

export const SUB_HEADER_LINKS: SubHeaderLink[] = [
  { label: "بیشترین تخفیفات", icon: "bolt", href: "/deals" },
  { label: "پرفروش‌ترین محصولات", icon: "flame", href: "/bestsellers" },
  { label: "جدیدترین محصولات", icon: "sparkles", href: "/newest" },
  { label: "پیشنهادهای ویژه", icon: "gift", href: "/deals" },
];

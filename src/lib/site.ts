export const CONTACT_INFO = {
  phone: "۰۲۱-۹۱۰۰۱۰۰۰",
  phoneEn: "+982191001000",
  email: "nima.hasani.dev@gmail.com",
  address: "تهران، خیابان ولیعصر، مجتمع تجاری دیجی‌کلون، طبقه ۳",
  hours: "شنبه تا پنجشنبه، ۹ صبح تا ۹ شب",
};

export const FOOTER_LINKS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "ارتباط با ما",
    links: [
      { label: "ارسال ایمیل", href: "mailto:nima.hasani.dev@gmail.com" },
    ],
  },
  {
    title: "با دیجی‌کلون",
    links: [
      { label: "درباره دیجی‌کلون", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
      { label: "مقالات و اخبار", href: "/articles" },
      { label: "فروشنده شوید", href: "/become-seller" },
    ],
  },
  {
    title: "خدمات مشتریان",
    links: [
      { label: "پاسخ به پرسش‌های متداول", href: "/faq" },
      { label: "رویه‌های بازگرداندن کالا", href: "/returns" },
      { label: "شرایط استفاده", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
    ],
  },
  {
    title: "اطلاعات معاملات شما",
    links: [
      { label: "نحوه ثبت سفارش", href: "/how-to-order" },
      { label: "رویه ارسال سفارش", href: "/shipping" },
      { label: "شیوه‌های پرداخت", href: "/payment" },
      { label: "پیگیری سفارش", href: "/track-order" },
    ],
  },
];

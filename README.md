<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-6E9F17?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Playwright-E33332?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" />
</p>

<h1 align="center">دیجی‌کلون | DigiClone</h1>

<p align="center">
  <b>یک فروشگاه اینترنتی کامل و فارسی با رابط کاربری راست‌چین، الهام‌گرفته از دیجی‌کالا</b><br/>
  <i>A full-featured Persian RTL e-commerce platform inspired by Digikala</i>
</p>

<div align="center">

[![Demo (Vercel)](https://img.shields.io/badge/دمو%20–%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://digikala-clone-nine.vercel.app)
[![Demo (Netlify)](https://img.shields.io/badge/دمو%20–%20Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://digicl0ne.netlify.app)

</div>

---

## درباره پروژه

**دیجی‌کلون** یک پروژه نمونه‌کار (portfolio) کامل و «پروداکشن‌گرید» است که با **Next.js 16 (App Router)**، **React 19** و **TypeScript** ساخته شده و یک فروشگاه اینترنتی تمام‌فارسی و راست‌چین را شبیه‌سازی می‌کند؛ از کاتالوگ محصولات و مگامنو گرفته تا سبد خرید، تسویه چندمرحله‌ای، پیگیری سفارش، دیدگاه‌ها و پنل مدیریت کامل.

این پروژه برای نشان دادن توانایی در **معماری وب مدرن، امنیت، تست‌نویسی و دیپلوی** طراحی شده است.

## اسکرین‌شات‌ها

<table>
  <tr>
    <td align="center"><b>صفحه اصلی</b></td>
    <td align="center"><b>مگامنوی دسته‌بندی</b></td>
  </tr>
  <tr>
    <td><img src="public/screenshots/hero.png" alt="صفحه اصلی" width="100%"/></td>
    <td><img src="public/screenshots/megamenu.png" alt="مگامنو" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>صفحه محصول</b></td>
    <td align="center"><b>قیمت لحظه‌ای طلا</b></td>
  </tr>
  <tr>
    <td><img src="public/screenshots/product.jpg" alt="صفحه محصول" width="100%"/></td>
    <td><img src="public/screenshots/gold-price.jpg" alt="قیمت طلا" width="100%"/></td>
  </tr>
</table>

## امکانات

### فروشگاه
- **کاتالوگ محصولات** — بیش از ۱٬۰۰۰ محصول در ۱۱۶ دسته و زیردسته با تصویر، قیمت، تخفیف، امتیاز و تعداد فروش
- **مگامنوی داینامیک** — ساختار گروه/دسته/زیردسته از دیتابیس خوانده می‌شود و از طریق پنل مدیریت قابل ویرایش است
- **جستجوی پیشرفته** — جستجوی نام محصول و دسته با نرمال‌سازی فارسی (`/search?q=`)
- **صفحات مجموعه** — `/deals` (تخفیف‌ها)، `/bestsellers` (پرفروش‌ها)، `/newest` (جدیدترین)
- **صفحه طلای لحظه‌ای** — قیمت لحظه‌ای طلا و سکه با API ناواسان + کش
- **بلاگ فارسی** — مقاله با صفحه جزئیات و بلوک‌های محتوایی

### خرید
- **سبد خرید** — مبتنی بر localStorage با مدیریت رنگ/سایز/فروشنده
- **تسویه چندمرحله‌ای** — انتخاب استان و شهر فارسی (۳۱ استان)، زمان تحویل، استفاده از اطلاعات قبلی گیرنده
- **پرداخت نمایشی** — شبیه‌ساز درگاه پرداخت (بدون تراکنش واقعی)
- **پیگیری سفارش** — تایم‌لاین گرافیکی سه‌ساعته با صفحه `/orders/[id]`
- **دیدگاه و امتیاز** — فقط خریداران سفارش تحویل‌شده می‌توانند دیدگاه ثبت کنند (پیشگیری از نظر جعلی)

### حساب کاربری
- ثبت‌نام / ورود / خروج، پروفایل، تاریخچه سفارش‌ها
- بازیابی رمز عبور با ایمیل (Resend)
- **قفل امنیتی سمت سرور** — پس از ۵ تلاش ناموفق، حساب به‌مدت ۶۰ ثانیه قفل می‌شود (حتی با رمز درست)

### پنل مدیریت `/admin`
- داشبورد آمار، مدیریت محصولات (ویرایش، رنگ‌ها، سایزها، فروشندگان، گالری، دیدگاه‌ها، انتقال محصول)
- مدیریت دسته‌بندی و ساختار مگامنو (گروه‌ها/دسته‌ها/زیردسته‌ها)
- مدیریت سفارش‌ها (تأیید، وضعیت، کسر موجودی)، کاربران، تیکت‌های پشتیبانی، مقالات
- آپلود تصویر/ویدئو با بهینه‌سازی sharp و ذخیره در Vercel Blob

### رابط کاربری
- کاملاً فارسی و راست‌چین با فونت وزیرمتن
- تم تیره/روشن بدون فلش هنگام بارگذاری
- چت پشتیبانی ۲۴/۷ با پاسخ‌های سریع
- طراحی ریسپانسیو کامل (موبایل، تبلت، دسکتاپ)

## امنیت

- رمزنگاری رمز عبور با **scrypt + salt** و مقایسه timing-safe
- توکن‌های احراز هویت **HMAC-SHA256** با انقضای ۳۰ روزه
- **قفل سمت سرور** به‌ازای حساب پس از تلاش‌های ناموفق
- محدودیت نرخ (rate limiting) به‌ازای IP در همه endpoint های حساس
- محافظت در برابر user enumeration (پاسخ یکسان برای ایمیل ناموجود و رمز اشتباه)
- آپلود امن: بررسی magic bytes، مسدودسازی SVG، بهینه‌سازی و تبدیل به WebP
- هدرهای امنیتی و **CSP** روی همه مسیرها
- `npm audit` : **۰ آسیب‌پذیری**

## تکنولوژی‌ها

| لایه | تکنولوژی |
| ------------ | ------------------------------------------- |
| فریم‌ورک | Next.js 16 (App Router، Server Components) |
| رابط کاربری | React 19، Tailwind CSS v4 |
| زبان | TypeScript |
| دیتابیس | PostgreSQL (Neon) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| احراز هویت | HMAC-SHA256 (دستی، بدون وابستگی خارجی) |
| ایمیل | Resend |
| فایل | Vercel Blob + sharp |
| فونت | Vazirmatn (via `next/font`) |
| تست | Vitest، React Testing Library، Playwright |
| دیپلوی | Vercel و Netlify |

## شروع کار

### پیش‌نیازها

- **Node.js** 20+
- **PostgreSQL** 14+ (لوکال یا ابری مثل Neon)

### ۱. نصب وابستگی‌ها

```bash
npm install
```

### ۲. تنظیم محیط

از روی الگو یک فایل `.env` بسازید:

```bash
cp .env.example .env
```

متغیرهای لازم:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/digikala"
AUTH_SECRET="یک-مقدار-تصادفی-طولانی"
SYNC_SECRET="یک-مقدار-تصادفی-طولانی"
```

### ۳. راه‌اندازی دیتابیس

```bash
npx prisma migrate deploy
npx prisma generate
```

### ۴. بارگذاری داده اولیه (اختیاری)

```bash
npx prisma db seed
```

### ۵. اجرای برنامه

```bash
npm run dev
```

برنامه روی [http://localhost:3000](http://localhost:3000) در دسترس است.

## ساختار پروژه

```
src/
├── app/                  # App Router: صفحات، چیدمان‌ها، route handler ها
│   ├── api/              # REST API (register, login, orders, search, admin/...)
│   ├── admin/            # پنل مدیریت
│   ├── product/[slug]/   # صفحه محصول
│   ├── category/[slug]/  # صفحه دسته
│   ├── orders/           # تاریخچه و جزئیات سفارش
│   └── ...               # صفحات اطلاعاتی (FAQ، تماس، قوانین و...)
├── components/           # کامپوننت‌های قابل استفاده مجدد
└── lib/                  # ابزارها: prisma, auth, password, rate-limit, ...
prisma/
├── schema.prisma         # مدل داده
├── migrations/           # مهاجرت‌های نسخه‌بندی‌شده
└── seed/                 # اسکریپت‌های داده اولیه
public/images/products/   # تصاویر محصولات
```

## اسکریپت‌ها

| فرمان | توضیح |
| ---------------------- | --------------------------------- |
| `npm run dev` | اجرای سرور توسعه |
| `npm run build` | ساخت نسخه تولید (با `prisma generate`) |
| `npm start` | اجرای نسخه تولید |
| `npm run lint` | اجرای ESLint |
| `npm test` | اجرای تست‌های واحد و کامپوننت (Vitest) |
| `npm run test:e2e` | اجرای تست‌های E2E (Playwright) |
| `npx prisma studio` | مرور دیتابیس در مرورگر |

## تست‌ها

پروژه **۱۳۵ تست** در ۲۲ فایل دارد که همه سبز هستند:

```bash
npm test
```

| لایه | ابزار | پوشش |
| ----------------- | -------------- | -------------------------------------------------- |
| تست واحد | Vitest | توابع قالب‌بندی، نرمال‌سازی فارسی، HMAC auth، هش رمز، قفل ورود، نرخ محدودیت |
| تست کامپوننت | Vitest + RTL | Rating، PriceBadge، ProductCard، CheckoutForm |
| تست یکپارچه‌سازی | Vitest | منطق حمل‌ونقل، تایم‌لاین سفارش، سبد خرید localStorage |
| E2E | Playwright | صفحه اصلی، جستجو، محصول ← سبد، صفحات دسته |

## دیپلوی

پروژه با `vercel.json` آماده دیپلوی است — build pipeline شامل
`prisma migrate deploy → prisma generate → next build` می‌شود. کافی است ریپو را به **Vercel**
وصل کنید و `DATABASE_URL` را به‌عنوان environment variable تنظیم کنید.

نمونه‌های زنده:
- [Vercel](https://digikala-clone-nine.vercel.app)
- [Netlify](https://digicl0ne.netlify.app)

## لایسنس

این پروژه تحت **لایسنس MIT** منتشر شده است — برای جزئیات به [LICENSE](LICENSE) مراجعه کنید.

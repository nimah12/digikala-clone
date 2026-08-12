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
  <b>یک فروشگاه اینترنتی کامل، فارسی و راست‌چین به سبک دیجی‌کالا</b><br/>
  <i>A full-featured Persian RTL e-commerce platform inspired by Digikala</i>
</p>

---

# English

**DigiClone** is a production-grade e-commerce web application built with the **Next.js App Router**, **React 19**, and **TypeScript**. It features a fully Persian, RTL interface styled like Digikala, with a complete product catalog, mega-menu navigation, cart & checkout, user accounts, order tracking, reviews, vendor listings, notifications, and a blog — all backed by **PostgreSQL** via **Prisma**.

## ✨ Features

- **Product catalog** — 1,031 seeded products across 20 categories with images, pricing, discounts, ratings and sales counts
- **Rich catalog** — every product ships with a full Persian description (intro + specs + warranty/shipping), and every mega-menu subcategory lists 12+ products
- **Advanced search** — searches product names *and* category names (`/search?q=`)
- **Curated collections** — dedicated `/deals`, `/bestsellers`, `/newest` listing pages
- **Digikala-style mega menu** — two-panel group + subcategory navigation with hover interaction
- **Responsive design** — mobile drawer menu, adaptive grids, sticky header
- **Shopping experience** — cart (localStorage-backed), multi-step checkout, orders & dashboard
- **Province & city selector** — searchable Persian province/city dropdown for the receiver info (31 provinces, alphabetically sorted)
- **Smart checkout** — free shipping to Tehran & Alborz, delivery day/time picker, and one-click reuse of your previous receiver info
- **Demo payment gateway** — a simulated SADAD / Shaparak-style checkout with a 5-digit security captcha (no real transactions)
- **Live order tracking** — a graphical 3-hour timeline with status derived from the order time, a ×60 demo speed-up, and a dedicated `/orders/[id]` detail page
- **User accounts** — register / login / logout, profile, order history, password reset
- **Product detail pages** — reviews with ratings, vendor (seller) comparisons
- **Notifications** — functional in-app notification center + bell with unread badges; order notifications link straight to order tracking
- **Blog** — Persian articles with detail pages
- **RTL & Persian typography** — Vazirmatn font, full Persian localization
- **Dark / light themes** — persisted, flash-free switching
- **Info & support pages** — FAQ, shipping, returns, payment, contact, about, 24/7 support chat with quick replies

## 🛠 Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Framework    | Next.js 16 (App Router, Server Components)    |
| UI           | React 19, Tailwind CSS v4                     |
| Language     | TypeScript                                    |
| Database     | PostgreSQL                                    |
| ORM          | Prisma 7 (with `@prisma/adapter-pg`)          |
| Fonts        | Vazirmatn (via `next/font`)                   |
| Deployment   | Vercel-ready (`vercel.json`)                  |
| Testing      | Vitest, React Testing Library, Playwright      |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ running locally (or a hosted instance)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Set the required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/digikala"
```

### 3. Set up the database

Apply migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Seed the database (optional)

Loads 1,031 products, 20 categories, vendors, reviews and full Persian product descriptions:

```bash
npx prisma db seed
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

```
src/
├── app/                  # App Router: pages, layouts, route handlers
│   ├── api/              # REST API (register, login, orders, search, ...)
│   ├── product/[slug]/   # Product detail
│   ├── category/[slug]/  # Category listing
│   ├── deals/            # Discounts collection
│   ├── bestsellers/      # Best sellers collection
│   ├── newest/           # New arrivals collection
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Checkout flow
│   ├── orders/           # Order history & graphical detail (/orders/[id])
│   ├── track-order/      # Order tracking timeline
│   ├── dashboard/        # User dashboard
│   ├── articles/         # Blog
│   └── ...               # Static info pages (FAQ, shipping, contact, ...)
├── components/           # Reusable UI (Header, ProductCard, Footer, ...)
├── lib/                  # Utilities: prisma, cart, theme, categories, actions
prisma/
├── schema.prisma         # Data model
├── migrations/           # Versioned SQL migrations
└── seed/                 # Database seeding scripts
scripts/                  # Asset generation & dev utilities
public/images/products/   # Product images (SVG)
archive/patches/          # Historical dev patches (no longer applied)
```

## 🔌 API Routes

| Method | Route                    | Description                        |
| ------ | ------------------------ | ---------------------------------- |
| POST   | `/api/register`          | Create a user account              |
| POST   | `/api/login`             | Authenticate a user                |
| POST   | `/api/forgot-password`   | Request a password reset           |
| GET    | `/api/products`          | List products (queryable)          |
| GET    | `/api/search`            | Search products & categories       |
| GET    | `/api/orders`            | List orders for the current user   |
| POST   | `/api/orders`            | Create an order                    |
| POST   | `/api/reviews`           | Submit a product review / rating   |
| GET    | `/api/notifications`     | Fetch notifications                |

## 📦 Available Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the development server     |
| `npm run build`        | Production build                 |
| `npm start`            | Run the production build         |
| `npm run lint`         | Run ESLint                       |
| `npm test`            | Run unit & component tests (Vitest) |
| `npm run test:e2e`    | Run end-to-end tests (Playwright) |
| `npx prisma studio`    | Browse the database in the browser |

## 🧪 Testing

The project has a comprehensive test suite with **55 tests** across unit, component, and end-to-end layers:

```bash
npm test           # Run 46 unit/component tests
npm run test:e2e   # Run 9 E2E tests against the live site
```

| Layer             | Tool           | What's covered                                           |
| ----------------- | -------------- | -------------------------------------------------------- |
| Unit tests        | Vitest         | Format functions, Persian normalization, HMAC auth, password hashing, provinces data |
| Component tests   | Vitest + RTL   | Rating, PriceBadge, ProductCard, AddToCartButton         |
| Integration tests | Vitest         | Shipping logic, order timeline, cart localStorage        |
| E2E tests         | Playwright     | Homepage, search flow, product → cart, category pages    |

## ☁️ Deployment

The repo ships with a `vercel.json` that wires the full build pipeline
(`prisma migrate deploy → prisma generate → next build`), so it deploys to
**Vercel** out of the box — just connect your repo and add the `DATABASE_URL`
environment variable.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes
4. Push and open a Pull Request

## 📄 License

This project is released under the **MIT License** — see the [LICENSE](LICENSE) file.

---

# فارسی

**دیجی‌کلون** یک فروشگاه اینترنتی کامل است که با **Next.js App Router**، **React 19** و **TypeScript** ساخته شده. رابط کاربری کاملاً فارسی و راست‌چین با ظاهری الهام‌گرفته از دیجی‌کالا دارد و شامل کاتالوگ کامل محصولات، منوی مگا، سبد خرید و تسویه، حساب کاربری، پیگیری سفارش، دیدگاه‌ها، فروشنده‌ها، اعلان‌ها و وبلاگ است. دیتابیس پروژه **PostgreSQL** است و از طریق **Prisma** مدیریت می‌شود.

## ✨ امکانات

- **کاتالوگ محصولات** — ۱٬۰۳۱ محصول سیدشده در ۲۰ دسته‌بندی با تصویر، قیمت، تخفیف، امتیاز و تعداد فروش
- **کاتالوگ غنی** — همه محصولات دارای توضیح فارسی کامل (معرفی + ویژگی + ضمانت/ارسال) هستند و هر شاخه از منوی دسته‌بندی حداقل ۱۲ محصول دارد
- **جستجوی پیشرفته** — جستجو در نام محصول *و* نام دسته‌بندی (`/search?q=`)
- **مجموعه‌های ویژه** — صفحات اختصاصی `/deals` (تخفیف‌دار)، `/bestsellers` (پرفروش‌ترین) و `/newest` (جدیدترین)
- **مگامنو به سبک دیجی‌کالا** — پنل دوتایی گروه‌ها و زیردسته‌ها با تعامل هاور
- **طراحی واکنش‌گرا** — منوی کشویی موبایل، گریدهای تطبیق‌پذیر، هدر چسبان
- **تجربه خرید** — سبد خرید (ذخیره در localStorage)، تسویه حساب چندمرحله‌ای، سفارش‌ها و داشبورد
- **انتخابگر استان و شهرستان** — دراپ‌داون جستجوپذیر فارسی برای اطلاعات گیرنده (۳۱ استان، مرتب‌شده به ترتیب الفبا)
- **تسویه هوشمند** — ارسال رایگان به استان‌های تهران و البرز، انتخاب روز و بازه تحویل، و استفاده یک‌کلیکی از اطلاعات گیرنده سفارش قبلی
- **درگاه پرداخت نمایشی** — درگاه شبیه‌سازی‌شده سداد / شاپرک با کپچای امنیتی ۵ رقمی (بدون تراکنش واقعی)
- **پیگیری زنده سفارش** — تایم‌لاین گرافیکی ۳ ساعته با وضعیت محاسبه‌شده از زمان ثبت سفارش، دکمه تسریع دمو ×۶۰ و صفحه جزئیات اختصاصی `/orders/[id]`
- **حساب کاربری** — ثبت‌نام / ورود / خروج، پروفایل، تاریخچه سفارش‌ها، بازیابی رمز عبور
- **صفحات محصول** — دیدگاه‌ها با امتیازدهی و مقایسه فروشنده‌ها
- **اعلان‌ها** — مرکز اعلان درون‌برنامه‌ای + زنگوله با نشانگر پیام‌های نخوانده؛ اعلان سفارش با کلیک مستقیم به صفحه پیگیری همان سفارش می‌رود
- **وبلاگ** — مقالات فارسی با صفحه جزئیات
- **راست‌چین و فارسی** — فونت وزیرمتن و بومی‌سازی کامل
- **حالت شب / روز** — پایدار، بدون فلش هنگام جابه‌جایی
- **صفحات اطلاعاتی و پشتیبانی** — سوالات متداول، ارسال، بازگشت کالا، پرداخت، تماس، درباره ما، چت پشتیبانی ۲۴ ساعته با پاسخ‌های سریع

## 🛠 تکنولوژی‌ها

| لایه         | فناوری                                     |
| ------------ | ------------------------------------------ |
| فریم‌ورک     | Next.js 16 (App Router، کامپوننت سرور)     |
| رابط کاربری  | React 19، Tailwind CSS v4                   |
| زبان         | TypeScript                                 |
| دیتابیس      | PostgreSQL                                 |
| ORM          | Prisma 7 (با `@prisma/adapter-pg`)          |
| فونت         | وزیرمتن (از طریق `next/font`)              |
| استقرار      | آماده Vercel (`vercel.json`)               |
| تست         | Vitest، React Testing Library، Playwright    |

## 🚀 شروع کار

### پیش‌نیازها

- **Node.js** 20 به بالا
- **PostgreSQL** 14 به بالا (محلی یا ابری)

### ۱. نصب وابستگی‌ها

```bash
npm install
```

### ۲. پیکربندی متغیر محیطی

فایل `.env` را از روی قالب بسازید:

```bash
cp .env.example .env
```

و متغیرهای لازم را تنظیم کنید:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/digikala"
```

### ۳. راه‌اندازی دیتابیس

اجرای مایگریشن‌ها و تولید کلاینت Prisma:

```bash
npx prisma migrate deploy
npx prisma generate
```

### ۴. سید دیتابیس (اختیاری)

بارگذاری ۱٬۰۳۱ محصول، ۲۰ دسته‌بندی، فروشنده‌ها، دیدگاه‌ها و توضیحات فارسی محصولات:

```bash
npx prisma db seed
```

### ۵. اجرای برنامه

```bash
npm run dev
```

سپس [http://localhost:3000](http://localhost:3000) را باز کنید.

## 📂 ساختار پروژه

```
src/
├── app/                  # App Router: صفحات، لی‌اوت، route handler ها
│   ├── api/              # REST API (ثبت‌نام، ورود، سفارش‌ها، جستجو، ...)
│   ├── product/[slug]/   # جزئیات محصول
│   ├── category/[slug]/  # لیست دسته‌بندی
│   ├── deals/            # مجموعه تخفیف‌دارها
│   ├── bestsellers/      # مجموعه پرفروش‌ترین‌ها
│   ├── newest/           # مجموعه جدیدترین‌ها
│   ├── cart/             # سبد خرید
│   ├── checkout/         # فرآیند تسویه حساب
│   ├── orders/           # تاریخچه سفارش‌ها و جزئیات گرافیکی (/orders/[id])
│   ├── track-order/      # تایم‌لاین پیگیری سفارش
│   ├── dashboard/        # داشبورد کاربر
│   ├── articles/         # وبلاگ
│   └── ...               # صفحات اطلاعاتی (سوالات متداول، ارسال، تماس، ...)
├── components/           # کامپوننت‌های قابل استفاده (Header، ProductCard، Footer، ...)
├── lib/                  # ابزارها: prisma، سبد خرید، تم، دسته‌بندی، actions
prisma/
├── schema.prisma         # مدل داده
├── migrations/           # مایگریشن‌های SQL نسخه‌بندی‌شده
└── seed/                 # اسکریپت‌های سید دیتابیس
scripts/                  # ابزارهای تولید Asset و توسعه
public/images/products/   # تصاویر محصولات (SVG)
archive/patches/          # پچ‌های قدیمی توسعه (دیگر اعمال نمی‌شوند)
```

## 🔌 مسیرهای API

| متد   | مسیر                      | توضیح                              |
| ----- | ------------------------- | ---------------------------------- |
| POST  | `/api/register`           | ساخت حساب کاربری                    |
| POST  | `/api/login`              | احراز هویت کاربر                    |
| POST  | `/api/forgot-password`    | درخواست بازیابی رمز عبور            |
| GET   | `/api/products`           | فهرست محصولات (با امکان فیلتر)      |
| GET   | `/api/search`             | جستجوی محصولات و دسته‌بندی‌ها       |
| GET   | `/api/orders`             | سفارش‌های کاربر جاری                |
| POST  | `/api/orders`             | ثبت سفارش جدید                      |
| POST  | `/api/reviews`            | ثبت دیدگاه و امتیاز محصول           |
| GET   | `/api/notifications`      | دریافت اعلان‌ها                      |

## 📦 اسکریپت‌ها

| فرمان                 | توضیح                                   |
| --------------------- | -------------------------------------- |
| `npm run dev`         | اجرای سرور توسعه                        |
| `npm run build`       | بیلد نسخه تولید                          |
| `npm start`           | اجرای نسخه تولید                        |
| `npm run lint`        | اجرای ESLint                            |
| `npm test`           | اجرای تست‌های یونیت/کامپوننت (Vitest)  |
| `npm run test:e2e`   | اجرای تست‌های E2E روی سایت لایو (Playwright) |
| `npx prisma studio`   | مشاهده دیتابیس در مرورگر                |

## 🧪 تست‌ها

پروژه دارای مجموعه تست جامعی با **۵۵ تست** در سه لایه یونیت، کامپوننت و E2E است:

```bash
npm test           # اجرای ۴۶ تست یونیت/کامپوننت
npm run test:e2e   # اجرای ۹ تست E2E روی سایت لایو
```

| لایه              | ابزار          | چه چیزی پوشش داده می‌شود                                    |
| ----------------- | -------------- | ---------------------------------------------------------- |
| تست‌های یونیت     | Vitest         | توابع فرمت، نرمال‌سازی فارسی، امضای HMAC، هش رمز، داده استان‌ها |
| تست‌های کامپوننت  | Vitest + RTL   | Rating، PriceBadge، ProductCard، AddToCartButton           |
| تست‌های یکپارچه   | Vitest         | منطق ارسال، تایم‌لاین سفارش، localStorage سبد خرید        |
| تست‌های E2E       | Playwright     | صفحه اصلی، جستجو، محصول → سبد، صفحات دسته‌بندی           |

## ☁️ استقرار

پروژه با `vercel.json` عرضه شده که کل مراحل بیلد
(`prisma migrate deploy → prisma generate → next build`) را خودکار انجام می‌دهد،
پس بدون تغییر خاصی روی **Vercel** مستقر می‌شود — فقط ریپو را متصل و متغیر
`DATABASE_URL` را تنظیم کنید.

## 🤝 مشارکت

1. ریپو را فورک کنید
2. یک برنچ بسازید (`git checkout -b feat/your-feature`)
3. تغییرات را کامیت کنید
4. پوش کنید و یک Pull Request باز کنید

## 📄 لایسنس

این پروژه تحت **لایسنس MIT** منتشر می‌شود — فایل [LICENSE](LICENSE) را ببینید.

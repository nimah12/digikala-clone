# راهنمای نصب پنل آپلود عکس محصولات

## ۱) کپی کردن فایل‌ها
تمام فایل‌های داخل این zip رو با همون مسیر داخل پوشه‌ی پروژه‌ت (`~/projects/digikala-clone`) کپی کن.
یعنی مثلاً `src/lib/admin.ts` باید بره داخل `~/projects/digikala-clone/src/lib/admin.ts`.

فایل‌ها همه جدیدن، هیچ فایل موجودی رو override نمی‌کنن — به جز چیزی که خودت دستی توی مرحله‌ی بعد اضافه می‌کنی.

## ۲) اضافه کردن فیلد role به مدل User
فایل `prisma/schema.prisma` رو باز کن، مدل `User` رو پیدا کن و این خط رو بهش اضافه کن:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  phone     String?  @unique
  name      String?
  password  String?
  role      String   @default("user")   // <-- این خط جدیده
  createdAt DateTime @default(now())
  cart   Cart?
  orders Order[]
}
```

بعد توی ترمینال:
```bash
cd ~/projects/digikala-clone
npx prisma migrate dev --name add_user_role
```

این migration رو local اجرا می‌کنه. برای production (Neon)، وقتی push کنی و Vercel دیپلوی کنه، اگه `prisma migrate deploy` توی build script داری خودش اجرا میشه؛ اگه نه، باید دستی توی Neon SQL Editor بزنی:
```sql
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';
```

## ۳) خودت رو ادمین کن
توی Neon SQL Editor (یا psql local):
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'ایمیل خودت اینجا';
```

## ۴) نصب و راه‌اندازی Vercel Blob
```bash
npm install @vercel/blob
```

بعد:
1. برو به داشبورد Vercel → پروژه‌ت → تب **Storage** → **Create Database** → **Blob**
2. یه اسم بده (مثلاً `digikala-images`) و بسازش، بعد به پروژه‌ت وصلش کن (Connect Project)
3. این کار خودکار یه env variable به اسم `BLOB_READ_WRITE_TOKEN` به پروژه‌ت روی Vercel اضافه می‌کنه (برای production)
4. برای تست local، این دستور رو بزن تا env variableها رو بکشی پایین:
   ```bash
   vercel env pull .env.local
   ```
   (اگه Vercel CLI نصب نداری: `npm install -g vercel` و بعد `vercel login`)

## ۵) تست local
```bash
npm run dev
```
با همون اکانتی که ادمینش کردی لاگین کن (از صفحه‌ی `/login`)، بعد برو به آدرس:
```
http://localhost:3000/admin/products
```
باید لیست محصولات موبایل رو ببینی، با دکمه‌ی انتخاب فایل کنار هرکدوم. عکس رو انتخاب کن، خودش آپلود میشه و عکس جدید رو نشون میده.

## ۶) نکته‌ی مهم درباره‌ی فیلتر دسته‌بندی
توی فایل `src/app/api/admin/products/route.ts` فرض کردم که مدل `Category` یه فیلد `name` داره که مقادیری مثل `"mobile"` و `"laptop"` توش هست (طبق چیزی که قبلاً گفته بودی توی seed.ts). اگه دیدی لیست محصولات خالی میاد، این خط رو توی همون فایل چک کن و مطمئن شو اسم فیلد درسته:
```ts
where: categoryName ? { category: { is: { name: categoryName } } } : undefined,
```

## ۷) دیپلوی روی Vercel
بعد از تست local:
```bash
git add .
git commit -m "add admin image upload panel"
git push
```
Vercel خودش دیپلوی می‌کنه. یادت نره env variable مربوط به Blob رو توی تنظیمات production پروژه هم چک کنی که وصل شده باشه (مرحله‌ی ۴ خودش این کارو می‌کنه اگه از داشبورد Connect Project زده باشی).

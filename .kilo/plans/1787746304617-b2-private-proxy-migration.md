# مهاجرت از Vercel Blob به Backblaze B2 (باکت Private + پراکسی داخلی)

## هدف
جایگزینی `@vercel/blob` با Backblaze B2 بدون نیاز به کارت اعتباری، با نگه داشتن باکت در حالت **Private** و سرو کردن فایل‌ها از طریق یک route داخلی در خود پروژه.

## وضعیت فعلی
- برنچ `migrate-to-b2` از قبل وجود دارد و شامل کد اولیه است، **اما آن کد برای باکت Public طراحی شده** (`B2_PUBLIC_URL` + URL مستقیم از دامنه‌ی B2). با باکت Private این کد کار نمی‌کند و باید بازطراحی شود.
- استفاده‌های فعلی از Blob روی main فقط ۲ فایل است:
  - `src/app/api/admin/upload/route.ts`
  - `src/app/api/admin/products/[id]/media/route.ts`
- URLهای مدیا در جدول `ProductMedia.url` ذخیره می‌شوند و کامپوننت‌ها با `next/image` رندرشان می‌کنند.
- CSP در `src/proxy.ts` و `remotePatterns` در `next.config.ts` فعلاً به دامنه‌ی vercel-storage اشاره دارند.

## تصمیمات طراحی
1. **باکت Private می‌ماند** (تصمیم کاربر؛ Public کارت اعتباری می‌خواهد).
2. **پراکسی داخلی**: route جدید `/api/media/[...key]` فایل را با `GetObjectCommand` از B2 می‌خواند و به مرورگر stream می‌کند. URLهای ذخیره‌شده در DB نسبی هستند: `/api/media/products/123/media/xxx.webp`.
   - مزیت‌ها: same-origin است (CSP ساده می‌شود)، مستقل از دامنه (با تغییر دامنه سایت URLها خراب نمی‌شوند)، next/image بدون remotePattern کار می‌کند.
3. **حذف `B2_PUBLIC_URL`** از env ها؛ متغیرهای نهایی:
   - `B2_ENDPOINT`, `B2_REGION`, `B2_ACCESS_KEY_ID`, `B2_SECRET_ACCESS_KEY`, `B2_BUCKET_NAME`
4. **حذف کامل `@vercel/blob`** از package.json (برنچ فعلی هم همین کار را کرده) و افزودن `@aws-sdk/client-s3`.

## تغییرات موردنیاز نسبت به کد فعلی برنچ `migrate-to-b2`

### ۱. بازنویسی `src/lib/b2.ts`
- `put(key, body, options)` → `PutObjectCommand` (بدون تغییر امضا). خروجی: `{ url: "/api/media/" + key }` (URL نسبی).
- `del(urlOrKey)` → استخراج key از URL نسبی `/api/media/<key>` یا URL مطلق قدیمی؛ سپس `DeleteObjectCommand`. اگر URL مربوط به B2 نبود (فایل قدیمی Vercel Blob)، خطا نیندازد — فقط لاگ کند و return (تا حذف رکورد قدیمی مسدود نشود).
- افزودن `getObjectStream(key)` برای مصرف route پراکسی.
- کلاینت S3 باید lazy ساخته شود یا خطای env فقط موقع فراخوانی واقعی پرتاب شود (الگوی `requireEnv` فعلی حفظ شود).

### ۲. route جدید `src/app/api/media/[...key]/route.ts`
- `GET`: دریافت object از B2 و بازگرداندن آن با:
  - `Content-Type` مناسب (از metadata شیء)
  - `Cache-Control: public, max-age=31536000, immutable` (کلیدها timestampدار و غیرتکراری‌اند)
  - stream کردن body (نه بافر کامل — مهم برای ویدئوهای تا 200MB)
- محدود کردن key: جلوگیری از path traversal (key از params آرایه‌ای است، با `/` join می‌شود؛ ورودی عجیب را 400 بده).
- این endpoint عمومی است (عکس‌های محصولات برای همه بازدیدکننده‌ها قابل مشاهده‌اند — مثل قبل).

### ۳. آپدیت CSP در `src/proxy.ts`
- چون مدیا same-origin شد، دامنه‌های `*.public.blob.vercel-storage.com` و `B2_ORIGIN` از CSP حذف شوند؛ `'self'` کافی است.

### ۴. آپدیت `next.config.ts`
- `remotePatterns` vercel-storage حذف شود. مسیرهای نسبی `/api/media/...` به remotePattern نیاز ندارند.

### ۵. `.env.example` و `.env.local`
- حذف `B2_PUBLIC_URL`؛ بقیه متغیرها با توضیح فارسی (مطابق سبک فعلی) بمانند.
- مقادیر واقعی توسط کاربر در `.env.local` و بعداً در Environment Variables پروژه Vercel پر شوند.

### ۶. پاکسازی برنچ
- فایل `migrate-to-b2.patch` (که صرفاً کپیِ diff است) از برنچ حذف شود.

## خارج از محدوده
- انتقال داده‌ی قدیمی از Vercel Blob به B2 (کاربر تأیید نکرد که داده‌ی حیاتی وجود دارد؛ URLهای قدیمی Blob در DB نمایش داده نمی‌شوند ولی حذفشان رکورد DB را خراب نمی‌کند — `del` روی دامنه‌ی ناشناخته fail-safe شد).
- CDN/custom domain روی B2 (در آینده در صورت نیاز به کاهش ترافیک سرور اضافه می‌شود).

## ریسک‌ها
- **Vercel Hobby**: پراکسی‌کردن ویدئوی 200MB از طریق serverless function ممکن است به محدودیت زمان اجرا بخورد (default حدود ۶۰ ثانیه). تصاویر مشکلی ندارند؛ ویدئو در عمل معمولاً OK است ولی باید تست شود.
- هر بار نمایش عکس یک request به function + یک request به B2 می‌رود؛ هدر `immutable` کش مرورگر این را فقط برای بازدید اول هزینه‌دار می‌کند.

## مراحل اجرا (ترتیبی)
1. `git checkout migrate-to-b2`
2. بازنویسی `src/lib/b2.ts` مطابق بخش ۱
3. ساخت `src/app/api/media/[...key]/route.ts` (بخش ۲)
4. آپدیت `src/proxy.ts` و `next.config.ts` (بخش‌های ۳ و ۴)
5. آپدیت `.env.example`، حذف `migrate-to-b2.patch` (بخش ۵ و ۶)
6. `npm install` (برای @aws-sdk/client-s3 اگر نصب نیست)
7. تست محلی (بخش validation)
8. پس از تأیید کاربر: merge به main

## اعتبارسنجی
1. `.env.local` را با مقادیر واقعی B2 پر کن (endpoint/region/keyID/applicationKey/bucket از داشبورد B2).
2. `npm run dev` → از پنل ادمین یک عکس آپلود کن؛ برگشته‌ی JSON باید URL نسبی `/api/media/...` باشد.
3. همان عکس در سایت/پنل نمایش داده شود (از طریق next/image) — یعنی پراکسی و Content-Type درست است.
4. یک محصول با چند عکس بساز، یکی را delete کن؛ فایل از باکت B2 حذف شده باشد و رکورد DB پاک شود.
5. یک ویدئوی کوچک (~20MB) آپلود و پخش کن.
6. `npm run build` و `npm run lint` (در صورت وجود) بدون خطا.
7. در صورت موفقیت: merge `migrate-to-b2` به `main` و ست کردن متغیرهای env در Vercel.

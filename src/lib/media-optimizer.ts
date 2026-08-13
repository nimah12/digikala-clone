import sharp from "sharp";

/**
 * بهینه‌سازی عکس بدون افت کیفیت محسوس:
 * - چرخش خودکار بر اساس EXIF
 * - تغییر اندازه فقط اگر بزرگ‌تر از حد مجاز باشد (پیش‌فرض ۱۶۰۰px)
 * - حذف متادیتای اضافی (EXIF) برای سبک‌تر شدن
 * - تبدیل به WebP (یا PNG برای تصاویر شفاف) با کیفیت بالا
 */
export async function optimizeImage(
  buffer: Buffer,
  opts?: { maxDimension?: number; quality?: number },
): Promise<{ data: Buffer; format: "webp" | "png" | "jpeg" }> {
  const max = opts?.maxDimension ?? 1600;
  const quality = opts?.quality ?? 82;

  let img = sharp(buffer, { failOn: "none" }).rotate();

  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  if (Math.max(w, h) > max) {
    img = img.resize({
      width: w >= h ? max : undefined,
      height: h > w ? max : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // تصاویر شفاف → PNG (WebP شفافیت را در همه مرورگرها خوب نمایش نمی‌دهد)
  if (meta.hasAlpha) {
    return {
      data: await img.png({ quality, compressionLevel: 9 }).toBuffer(),
      format: "png",
    };
  }
  return {
    data: await img.webp({ quality, effort: 6 }).toBuffer(),
    format: "webp",
  };
}

/**
 * تشخیص حجم ذخیره‌شده (٪ کاهش) — برای گزارش در پنل ادمین
 */
export function percentSaved(original: number, optimized: number): number {
  if (original <= 0) return 0;
  return Math.max(0, Math.round((1 - optimized / original) * 100));
}

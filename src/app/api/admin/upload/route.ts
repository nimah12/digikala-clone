import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";
import { optimizeImage, percentSaved } from "@/lib/media-optimizer";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (قبل از بهینه‌سازی)
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB برای ویدئو

// پسوندهای ویدئویی مجاز
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/ogg"];

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  // پوشه مقصد: پیش‌فرض products (برای عکس مقاله: articles، برای ویدئو: videos)
  const folder = String(formData.get("folder") ?? "products").replace(/[^a-z0-9-]/gi, "");
  const safeFolder = folder || "products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/") || VIDEO_TYPES.includes(file.type);
  const isImage = file.type.startsWith("image/");

  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "file must be an image or video" }, { status: 400 });
  }
  const sizeLimit = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  if (file.size > sizeLimit) {
    return NextResponse.json(
      { error: `file too large (max ${Math.floor(sizeLimit / 1024 / 1024)}MB)` },
      { status: 400 },
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/\.[^.]+$/, "");

  // ویدئو: بدون بهینه‌سازی (فرمت و کیفیت حفظ می‌شود) — فقط در پوشه videos ذخیره می‌شود
  if (isVideo) {
    const ext = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "mp4";
    const blob = await put(`${safeFolder}/${Date.now()}-${safeName}.${ext}`, file, {
      access: "public",
      contentType: file.type || "video/mp4",
    });
    return NextResponse.json({ url: blob.url, optimized: false, video: true });
  }

  try {
    // ۱) بهینه‌سازی با sharp: تغییر اندازه + WebP + حذف متادیتا
    const original = Buffer.from(await file.arrayBuffer());
    const { data, format } = await optimizeImage(original);

    // ۲) ذخیره نسخه بهینه‌شده در Blob
    const blob = await put(`${safeFolder}/${Date.now()}-${safeName}.${format}`, data, {
      access: "public",
      contentType: `image/${format}`,
    });

    return NextResponse.json({
      url: blob.url,
      optimized: true,
      originalBytes: original.length,
      optimizedBytes: data.length,
      savedPercent: percentSaved(original.length, data.length),
    });
  } catch (err) {
    console.error("[admin/upload] optimize failed:", err);
    // اگر بهینه‌سازی ناموفق بود، فایل اصلی آپلود شود
    const blob = await put(`${safeFolder}/${Date.now()}-${safeName}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url, optimized: false });
  }
}

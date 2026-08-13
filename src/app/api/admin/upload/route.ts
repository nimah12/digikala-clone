import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";
import { optimizeImage, percentSaved } from "@/lib/media-optimizer";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (قبل از بهینه‌سازی)

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  // پوشه مقصد: پیش‌فرض products (برای عکس مقاله: articles)
  const folder = String(formData.get("folder") ?? "products").replace(/[^a-z0-9-]/gi, "");
  const safeFolder = folder || "products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "file must be an image" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "file too large (max 20MB)" },
      { status: 400 },
    );
  }

  try {
    // ۱) بهینه‌سازی با sharp: تغییر اندازه + WebP + حذف متادیتا
    const original = Buffer.from(await file.arrayBuffer());
    const { data, format } = await optimizeImage(original);

    // ۲) ذخیره نسخه بهینه‌شده در Blob
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/\.[^.]+$/, "");
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
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const blob = await put(`${safeFolder}/${Date.now()}-${safeName}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url, optimized: false });
  }
}

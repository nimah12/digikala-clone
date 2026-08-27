import { NextResponse } from "next/server";
import { AwsClient } from "aws4fetch";
import { requireAdmin } from "@/lib/admin";
import { optimizeImage, percentSaved } from "@/lib/media-optimizer";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (قبل از بهینه‌سازی)
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB برای ویدئو

// پسوندهای ویدئویی مجاز
const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
];

// آدرس Worker که جلوی B2 مثل CDN عمل می‌کنه؛ خروجی آپلود این آدرس رو برمی‌گردونه
// (نه لینک مستقیم B2 و نه Vercel Blob)
const CDN_BASE_URL =
  process.env.B2_CDN_BASE_URL ??
  "https://digikala-clone-media.nimah12.workers.dev";

function b2Client() {
  return new AwsClient({
    accessKeyId: process.env.B2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: process.env.B2_REGION!,
  });
}

// آپلود یه فایل (Buffer یا Blob/File) به B2 با PUT امضا شده، و برگردوندن آدرس عمومی از طریق Worker/CDN
async function uploadToB2(
  key: string,
  body: Buffer | Blob,
  contentType: string,
): Promise<string> {
  const client = b2Client();
  const endpoint = process.env.B2_ENDPOINT!;
  const bucket = process.env.B2_BUCKET_NAME!;
  const originUrl = `${endpoint}/${bucket}/${key}`;

  // B2 (مثل S3) برای PUT مستقیم، هدر Content-Length رو صریحاً لازم داره.
  // چون بعضی از ران‌تایم‌های fetch (از جمله Node runtime روی Vercel) این هدر رو
  // موقع ارسال واقعی نادیده می‌گیرن/بازنویسی می‌کنن، body رو به یه Uint8Array
  // با طول مشخص تبدیل می‌کنیم و طولش رو صریحاً بین هدرهایی که امضا می‌شن می‌ذاریم.
  const bytes =
    body instanceof Blob
      ? new Uint8Array(await body.arrayBuffer())
      : new Uint8Array(body.buffer, body.byteOffset, body.byteLength);

  const signedRequest = await client.sign(originUrl, {
    method: "PUT",
    body: bytes as BodyInit,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.byteLength),
    },
  });

  const res = await fetch(signedRequest);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`B2 upload failed (${res.status}): ${text}`);
  }

  return `${CDN_BASE_URL}/${key}`;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  // پوشه مقصد: پیش‌فرض products (برای عکس مقاله: articles، برای ویدئو: videos)
  const folder = String(formData.get("folder") ?? "products").replace(
    /[^a-z0-9-]/gi,
    "",
  );
  const safeFolder = folder || "products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 });
  }

  const isVideo =
    file.type.startsWith("video/") || VIDEO_TYPES.includes(file.type);
  const isImage = file.type.startsWith("image/");

  if (!isVideo && !isImage) {
    return NextResponse.json(
      { error: "file must be an image or video" },
      { status: 400 },
    );
  }

  // بلاک SVG: قابلیت اجرای اسکریپت داخل آن = خطر XSS
  // (بعد از تبدیل به WebP توسط sharp، خروجی امن است ولی ورودی خام را قبول نمی‌کنیم)
  const isSvg =
    file.type === "image/svg+xml" || /\.[sS][vV][gG]$/.test(file.name);
  if (isSvg) {
    return NextResponse.json(
      { error: "SVG files are not allowed" },
      { status: 400 },
    );
  }

  // بررسی magic bytes برای اطمینان از اینکه نوع فایل با محتوای واقعی هم‌خوانی دارد
  // (جلوگیری از آپلود فایل‌های جعلی با پسوند/نوع دستکاری‌شده)
  const header = Buffer.from(await file.slice(0, 16).arrayBuffer());
  const looksLikeImage = isImage && looksLikeImageBytes(header);
  const looksLikeVideo = isVideo && looksLikeVideoBytes(header);
  if ((isImage && !looksLikeImage) || (isVideo && !looksLikeVideo)) {
    return NextResponse.json(
      { error: "file content does not match its type" },
      { status: 400 },
    );
  }
  const sizeLimit = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  if (file.size > sizeLimit) {
    return NextResponse.json(
      {
        error: `file too large (max ${Math.floor(sizeLimit / 1024 / 1024)}MB)`,
      },
      { status: 400 },
    );
  }

  const safeName = file.name
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .replace(/\.[^.]+$/, "");

  // helperها برای تشخیص magic bytes
  function looksLikeImageBytes(buf: Buffer): boolean {
    // JPEG, PNG, GIF, WebP, BMP, TIFF, AVIF (heic/heif)
    return (
      (buf[0] === 0xff && buf[1] === 0xd8) || // JPEG
      (buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47) || // PNG
      (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) || // GIF
      (buf[0] === 0x52 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x46) || // RIFF (WebP)
      (buf[0] === 0x42 && buf[1] === 0x4d) || // BMP
      (buf[0] === 0x49 &&
        buf[1] === 0x49 &&
        buf[2] === 0x2a &&
        buf[3] === 0x00) || // TIFF little
      (buf[0] === 0x4d &&
        buf[1] === 0x4d &&
        buf[2] === 0x00 &&
        buf[3] === 0x2a) || // TIFF big
      (buf[4] === 0x66 &&
        buf[5] === 0x74 &&
        buf[6] === 0x79 &&
        buf[7] === 0x70 &&
        buf[8] === 0x61 &&
        buf[9] === 0x76 &&
        buf[10] === 0x69 &&
        buf[11] === 0x66) // ftypavif
    );
  }

  function looksLikeVideoBytes(buf: Buffer): boolean {
    // MP4/MOV (ftyp), WebM/MKV (EBML 1A45DFA3)
    return (
      (buf[4] === 0x66 &&
        buf[5] === 0x74 &&
        buf[6] === 0x79 &&
        buf[7] === 0x70) || // ftyp
      (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) // EBML
    );
  }

  // ویدئو: بدون بهینه‌سازی (فرمت و کیفیت حفظ می‌شود) — فقط در پوشه videos ذخیره می‌شود
  if (isVideo) {
    const ext =
      file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "mp4";
    const contentType = file.type || "video/mp4";
    const key = `${safeFolder}/${Date.now()}-${safeName}.${ext}`;
    const url = await uploadToB2(key, file, contentType);
    return NextResponse.json({ url, optimized: false, video: true });
  }

  try {
    // ۱) بهینه‌سازی با sharp: تغییر اندازه + WebP + حذف متادیتا
    const original = Buffer.from(await file.arrayBuffer());
    const { data, format } = await optimizeImage(original);

    // ۲) ذخیره نسخه بهینه‌شده در B2
    const key = `${safeFolder}/${Date.now()}-${safeName}.${format}`;
    const url = await uploadToB2(key, data, `image/${format}`);

    return NextResponse.json({
      url,
      optimized: true,
      originalBytes: original.length,
      optimizedBytes: data.length,
      savedPercent: percentSaved(original.length, data.length),
    });
  } catch (err) {
    console.error("[admin/upload] optimize failed:", err);
    // اگر بهینه‌سازی ناموفق بود، فایل اصلی آپلود شود
    const key = `${safeFolder}/${Date.now()}-${safeName}`;
    const url = await uploadToB2(
      key,
      file,
      file.type || "application/octet-stream",
    );
    return NextResponse.json({ url, optimized: false });
  }
}

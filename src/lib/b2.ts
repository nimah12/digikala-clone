import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// کلاینت S3-compatible برای Backblaze B2 با باکت Private.
// برخلاف R2، اینجا region واقعاً معنا داره و باید مطابق endpoint ست بشه
// (مثلاً endpoint: https://s3.us-west-004.backblazeb2.com -> region: us-west-004)
let _b2: S3Client | null = null;

function client(): S3Client {
  if (!_b2) {
    const missing = ["B2_ENDPOINT", "B2_REGION", "B2_ACCESS_KEY_ID", "B2_SECRET_ACCESS_KEY"].filter(
      (name) => !process.env[name]
    );
    if (missing.length > 0) {
      throw new Error(`متغیرهای محیطی B2 تنظیم نشده‌اند: ${missing.join(", ")}`);
    }
    _b2 = new S3Client({
      region: process.env.B2_REGION!,
      endpoint: process.env.B2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _b2;
}

function bucketName(): string {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) throw new Error("B2_BUCKET_NAME تنظیم نشده است");
  return bucket;
}

type PutOptions = {
  access?: "public"; // برای سازگاری با امضای قبلی @vercel/blob؛ فایل‌ها از طریق پراکسی داخلی سرو می‌شوند
  contentType?: string;
};

type PutResult = {
  url: string;
};

/**
 * جایگزین put از @vercel/blob. همون امضا رو حفظ می‌کنه تا فراخوانی‌های
 * موجود در route ها بدون تغییر ساختاری کار کنن.
 * خروجی URL نسبی است (/api/media/<key>) چون باکت Private است و فایل‌ها
 * از route داخلی /api/media سرو می‌شوند.
 */
export async function put(
  key: string,
  body: Buffer | File | Blob,
  options: PutOptions = {}
): Promise<PutResult> {
  let uploadBody: Buffer;
  if (body instanceof Buffer) {
    uploadBody = body;
  } else {
    uploadBody = Buffer.from(await (body as Blob).arrayBuffer());
  }

  await client().send(
    new PutObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Body: uploadBody,
      ContentType: options.contentType,
    })
  );

  return { url: mediaUrl(key) };
}

/** URL نسبی سرو شدن یک key از پراکسی داخلی */
export function mediaUrl(key: string): string {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** استخراج key شیء در B2 از URL ذخیره‌شده (نسبی یا مطلق) */
export function keyFromUrl(url: string): string | null {
  const marker = "/api/media/";
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    try {
      return url
        .slice(idx + marker.length)
        .split("/")
        .map(decodeURIComponent)
        .join("/");
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * دریافت stream یک شیء برای سرو کردن از پراکسی داخلی.
 * range اختیاری، مقدار هدر Range مرورگر است (مثلاً bytes=0-1023) برای seek ویدئو.
 * خروجی شامل stream بدنه و Content-Type ذخیره‌شده است؛ caller باید stream را ببندد.
 */
export async function getObjectStream(
  key: string,
  range?: string
): Promise<{
  body: ReadableStream;
  contentType: string;
  contentLength: number | undefined;
  contentRange: string | undefined;
}> {
  const res = await client().send(
    new GetObjectCommand({
      Bucket: bucketName(),
      Key: key,
      ...(range ? { Range: range } : {}),
    })
  );
  if (!res.Body) {
    throw new Error("پاسخ خالی از B2");
  }
  return {
    body: res.Body as ReadableStream,
    contentType: res.ContentType || "application/octet-stream",
    contentLength: res.ContentLength,
    contentRange: res.ContentRange,
  };
}

/**
 * جایگزین del از @vercel/blob. ورودی همان URL ذخیره‌شده است (نسبی یا مطلق)؛
 * اگر URL مربوط به پراکسی داخلی نبود (مثلاً فایل قدیمی Vercel Blob)، بدون خطا رد می‌شود
 * تا حذف رکورد دیتابیس مسدود نشود.
 */
export async function del(url: string): Promise<void> {
  const key = keyFromUrl(url);
  if (!key) {
    console.warn(`[b2] URL خارج از مسیر /api/media است، حذف نشد: ${url}`);
    return;
  }

  await client().send(
    new DeleteObjectCommand({
      Bucket: bucketName(),
      Key: key,
    })
  );
}

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// کلاینت S3-compatible برای Backblaze B2.
// برخلاف R2، اینجا region واقعاً معنا داره و باید مطابق endpoint ست بشه
// (مثلاً endpoint: https://s3.us-west-004.backblazeb2.com -> region: us-west-004)
const b2 = new S3Client({
  region: requireEnv("B2_REGION") || "us-west-004",
  endpoint: requireEnv("B2_ENDPOINT"),
  credentials: {
    accessKeyId: requireEnv("B2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("B2_SECRET_ACCESS_KEY"),
  },
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // در build-time بعضی مسیرها import می‌شن بدون این‌که واقعاً صدا زده بشن؛
    // پرتاب خطا رو به زمان صدا زدن واقعی موکول می‌کنیم، نه import.
    return "";
  }
  return value;
}

function bucketName(): string {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) throw new Error("B2_BUCKET_NAME تنظیم نشده است");
  return bucket;
}

function publicBaseUrl(): string {
  const base = process.env.B2_PUBLIC_URL;
  if (!base) throw new Error("B2_PUBLIC_URL تنظیم نشده است");
  return base.replace(/\/$/, "");
}

type PutOptions = {
  access?: "public"; // برای سازگاری با امضای قبلی @vercel/blob؛ در B2 عمومی‌بودن از طریق تنظیمات باکت/دامنه کنترل می‌شود
  contentType?: string;
};

type PutResult = {
  url: string;
};

/**
 * جایگزین put از @vercel/blob. همون امضا رو حفظ می‌کنه تا فراخوانی‌های
 * موجود در route ها بدون تغییر ساختاری کار کنن.
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

  await b2.send(
    new PutObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Body: uploadBody,
      ContentType: options.contentType,
    })
  );

  return { url: `${publicBaseUrl()}/${key}` };
}

/**
 * جایگزین del از @vercel/blob. ورودی همون URL کامل فایل است؛
 * از روی B2_PUBLIC_URL کلید (path) استخراج می‌شود.
 */
export async function del(url: string): Promise<void> {
  const base = publicBaseUrl();
  if (!url.startsWith(base)) {
    // اگر URL مربوط به دامنه‌ی B2 فعلی نیست (مثلاً فایل قدیمی از Vercel Blob)، نادیده بگیر
    throw new Error(`URL خارج از دامنه‌ی B2 است: ${url}`);
  }
  const key = url.slice(base.length + 1);

  await b2.send(
    new DeleteObjectCommand({
      Bucket: bucketName(),
      Key: key,
    })
  );
}

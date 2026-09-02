// scripts/migrate-blob-to-b2.ts
// اجرا: npx tsx scripts/migrate-blob-to-b2.ts
//
// فایل‌های باقی‌مونده روی Vercel Blob رو دانلود و به Backblaze B2 آپلود می‌کنه.
// مسیر (pathname) هر فایل حفظ می‌شه تا با ساختار فعلی Worker سازگار بمونه.

import "dotenv/config";
import { list } from "@vercel/blob";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

console.log(
  "TOKEN:",
  process.env.BLOB_READ_WRITE_TOKEN ? "پیدا شد" : "پیدا نشد",
);
console.log("STORE_ID:", process.env.BLOB_STORE_ID ? "پیدا شد" : "پیدا نشد");

const b2 = new S3Client({
  endpoint: process.env.B2_ENDPOINT!,
  region: process.env.B2_REGION!,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.B2_BUCKET_NAME!;

async function alreadyExistsInB2(key: string): Promise<boolean> {
  try {
    await b2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function migrate() {
  let cursor: string | undefined;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  do {
    const result = await list({
      cursor,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      limit: 100,
    });

    for (const blob of result.blobs) {
      // pathname مثل "products/M-1606.webp" — دقیقاً همون چیزی که تو URL بعد از دامنه میاد
      const key = blob.pathname;

      try {
        if (await alreadyExistsInB2(key)) {
          console.log(`⏭️  رد شد (از قبل تو B2 هست): ${key}`);
          skipped++;
          continue;
        }

        const res = await fetch(blob.url);
        if (!res.ok) {
          throw new Error(`دانلود از Vercel Blob با خطا: ${res.status}`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());

        await b2.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType:
              (blob as { contentType?: string }).contentType ||
              "application/octet-stream",
          }),
        );

        console.log(
          `✅ منتقل شد: ${key} (${(buffer.length / 1024).toFixed(1)} KB)`,
        );
        migrated++;
      } catch (err) {
        console.error(`❌ خطا در انتقال ${key}:`, err);
        failed++;
      }
    }

    cursor = result.cursor;
  } while (cursor);

  console.log("\n--- خلاصه ---");
  console.log(`منتقل شد: ${migrated}`);
  console.log(`رد شد (تکراری): ${skipped}`);
  console.log(`خطا: ${failed}`);
}

migrate().catch((err) => {
  console.error("خطای کلی در اجرای اسکریپت:", err);
  process.exit(1);
});

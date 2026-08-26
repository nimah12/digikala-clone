import { NextResponse } from "next/server";
import { getObjectStream } from "@/lib/b2";

// هر سگمنت key فقط می‌تواند حروف، اعداد و . _ - باشد (مطابق safeName آپلود)
// این همزمان جلوی path traversal را هم می‌گیرد
const SEGMENT_RE = /^[a-zA-Z0-9._-]+$/;

// فقط Range های تک‌بازه‌ی معتبر فوروارد می‌شوند؛ بقیه نادیده گرفته می‌شوند (سرو کامل)
const RANGE_RE = /^bytes=\d*-\d*$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: segments } = await params;

  if (!Array.isArray(segments) || segments.length === 0 || segments.some((s) => !SEGMENT_RE.test(s))) {
    return NextResponse.json({ error: "invalid key" }, { status: 400 });
  }

  const key = segments.join("/");

  const rangeHeader = request.headers.get("range");
  const range = rangeHeader && RANGE_RE.test(rangeHeader) ? rangeHeader : undefined;

  try {
    const { body, contentType, contentLength, contentRange } = await getObjectStream(key, range);

    const headers = new Headers({
      "Content-Type": contentType,
      // کلیدها timestampدار و غیرتکراری‌اند؛ کش بلندمدت امن است
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
    });
    if (contentLength !== undefined) {
      headers.set("Content-Length", String(contentLength));
    }
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    return new Response(body, { status: contentRange ? 206 : 200, headers });
  } catch (err) {
    if (err instanceof Error && err.name === "InvalidRange") {
      return NextResponse.json({ error: "invalid range" }, { status: 416 });
    }
    const status =
      err instanceof Error && err.name === "NoSuchKey" ? 404 : 500;
    if (status === 500) {
      console.error(`[api/media] خطا در سرو کردن ${key}:`, err);
    }
    return NextResponse.json({ error: "not found" }, { status });
  }
}

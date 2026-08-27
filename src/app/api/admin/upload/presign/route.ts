import { NextResponse } from "next/server";
import { AwsClient } from "aws4fetch";
import { requireAdmin } from "@/lib/admin";

const CDN_BASE_URL =
  process.env.B2_CDN_BASE_URL ??
  "https://digikala-clone-media.nimah12.workers.dev";

const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
];

const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
const PRESIGN_EXPIRES_SECONDS = 60 * 15; // 15 دقیقه

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const contentType =
    typeof body?.contentType === "string" ? body.contentType : "";
  const size = typeof body?.size === "number" ? body.size : 0;
  const folder = String(body?.folder ?? "videos").replace(/[^a-z0-9-]/gi, "");
  const safeFolder = folder || "videos";

  if (!fileName || !contentType) {
    return NextResponse.json(
      { error: "fileName and contentType are required" },
      { status: 400 },
    );
  }

  const isVideo =
    contentType.startsWith("video/") || VIDEO_TYPES.includes(contentType);
  if (!isVideo) {
    return NextResponse.json(
      { error: "this endpoint is for video files only" },
      { status: 400 },
    );
  }

  if (size > 0 && size > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      {
        error: `file too large (max ${Math.floor(MAX_VIDEO_SIZE / 1024 / 1024)}MB)`,
      },
      { status: 400 },
    );
  }

  const safeName = fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .replace(/\.[^.]+$/, "");
  const ext = fileName.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "mp4";
  const key = `${safeFolder}/${Date.now()}-${safeName}.${ext}`;

  const client = new AwsClient({
    accessKeyId: process.env.B2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: process.env.B2_REGION!,
  });

  const endpoint = process.env.B2_ENDPOINT!;
  const bucket = process.env.B2_BUCKET_NAME!;
  const originUrl = new URL(`${endpoint}/${bucket}/${key}`);
  originUrl.searchParams.set("X-Amz-Expires", String(PRESIGN_EXPIRES_SECONDS));

  const signedRequest = await client.sign(originUrl.toString(), {
    method: "PUT",
    aws: { signQuery: true },
    headers: {
      "Content-Type": contentType,
    },
  });

  return NextResponse.json({
    uploadUrl: signedRequest.url,
    contentType,
    finalUrl: `${CDN_BASE_URL}/${key}`,
  });
}

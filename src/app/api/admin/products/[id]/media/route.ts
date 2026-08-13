import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { optimizeImage } from "@/lib/media-optimizer";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB (قبل از بهینه‌سازی)
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

function parseProductId(id: string) {
  const productId = Number(id);
  return Number.isInteger(productId) ? productId : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const productId = parseProductId(id);
  if (productId === null) {
    return NextResponse.json({ error: "invalid product id" }, { status: 400 });
  }

  const media = await prisma.productMedia.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ media });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const productId = parseProductId(id);
  if (productId === null) {
    return NextResponse.json({ error: "invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f) => f instanceof File) as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "no files provided" }, { status: 400 });
  }

  const lastMedia = await prisma.productMedia.findFirst({
    where: { productId },
    orderBy: { order: "desc" },
  });
  let nextOrder = (lastMedia?.order ?? -1) + 1;

  const created = [];
  const skipped: { name: string; reason: string }[] = [];

  for (const file of files) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      skipped.push({ name: file.name, reason: "must be an image or video" });
      continue;
    }
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      skipped.push({ name: file.name, reason: "image too large (max 5MB)" });
      continue;
    }
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      skipped.push({ name: file.name, reason: "video too large (max 100MB)" });
      continue;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/\.[^.]+$/, "");

    // تصاویر: بهینه‌سازی با sharp (WebP + تغییر اندازه + حذف متادیتا)
    // ویدیوها: بدون تغییر نگه داشته می‌شوند (کدگذاری مجدد نیاز به ffmpeg دارد)
    let blobUrl: string;
    if (isImage) {
      const original = Buffer.from(await file.arrayBuffer());
      try {
        const { data, format } = await optimizeImage(original);
        const blob = await put(
          `products/${productId}/media/${Date.now()}-${safeName}.${format}`,
          data,
          { access: "public", contentType: `image/${format}` }
        );
        blobUrl = blob.url;
      } catch {
        const blob = await put(
          `products/${productId}/media/${Date.now()}-${safeName}`,
          file,
          { access: "public" }
        );
        blobUrl = blob.url;
      }
    } else {
      const blob = await put(
        `products/${productId}/media/${Date.now()}-${safeName}`,
        file,
        { access: "public" }
      );
      blobUrl = blob.url;
    }

    const record = await prisma.productMedia.create({
      data: {
        productId,
        url: blobUrl,
        type: isImage ? "image" : "video",
        order: nextOrder,
      },
    });
    nextOrder += 1;
    created.push(record);
  }

  return NextResponse.json({ media: created, skipped });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const productId = parseProductId(id);
  if (productId === null) {
    return NextResponse.json({ error: "invalid product id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const mediaId = Number(searchParams.get("mediaId"));
  if (!Number.isInteger(mediaId)) {
    return NextResponse.json({ error: "invalid mediaId" }, { status: 400 });
  }

  const media = await prisma.productMedia.findUnique({ where: { id: mediaId } });
  if (!media || media.productId !== productId) {
    return NextResponse.json({ error: "media not found" }, { status: 404 });
  }

  await prisma.productMedia.delete({ where: { id: mediaId } });

  try {
    await del(media.url);
  } catch {
    // فایل روی Blob شاید از قبل حذف شده باشه؛ رکورد دیتابیس مهم‌تره
  }

  return NextResponse.json({ ok: true });
}

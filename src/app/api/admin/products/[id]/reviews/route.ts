import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function parseProductId(id: string) {
  const productId = Number(id);
  return Number.isInteger(productId) ? productId : null;
}

// میانگین امتیاز محصول را فقط بر اساس نظراتِ تأییدشده بازحساب می‌کند
async function recomputeProductRating(productId: number) {
  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const rating =
    agg._count._all > 0 ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : 0;
  await prisma.product.update({
    where: { id: productId },
    data: { rating, ratingCount: agg._count._all },
  });
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

  const reviews = await prisma.review.findMany({ where: { productId } });
  return NextResponse.json({ reviews });
}

export async function PATCH(
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

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const reviewId = Number(body.reviewId);
  if (!Number.isInteger(reviewId)) {
    return NextResponse.json({ error: "invalid reviewId" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.productId !== productId) {
    return NextResponse.json({ error: "review not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    data.title = title;
  }
  if (body.text !== undefined) {
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "text cannot be empty" }, { status: 400 });
    }
    data.text = text;
  }
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be an integer between 1 and 5" }, { status: 400 });
    }
    data.rating = rating;
  }
  if (body.author !== undefined) {
    const author = typeof body.author === "string" ? body.author.trim() : "";
    if (!author) {
      return NextResponse.json({ error: "author cannot be empty" }, { status: 400 });
    }
    data.author = author;
  }
  if (typeof body.approved === "boolean") {
    data.approved = body.approved;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const updated = await prisma.review.update({ where: { id: reviewId }, data });

  // اگر وضعیت تأیید یا امتیاز تغییر کرده، میانگین محصول را بازحساب کن
  if ("approved" in data || "rating" in data) {
    await recomputeProductRating(productId);
  }

  return NextResponse.json({ review: updated });
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
  const reviewId = Number(searchParams.get("reviewId"));
  if (!Number.isInteger(reviewId)) {
    return NextResponse.json({ error: "invalid reviewId" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.productId !== productId) {
    return NextResponse.json({ error: "review not found" }, { status: 404 });
  }

  await prisma.review.delete({ where: { id: reviewId } });

  // میانگین محصول را پس از حذف نظر بازحساب کن
  await recomputeProductRating(productId);

  return NextResponse.json({ ok: true });
}

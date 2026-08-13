import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function parseBody(body: Record<string, unknown>) {
  const id = String(body.id ?? "").trim();
  const title = String(body.title ?? "").trim();
  const excerpt = String(body.excerpt ?? "").trim();
  const category = String(body.category ?? "").trim();
  const date = String(body.date ?? "").trim();
  const image = String(body.image ?? "").trim();
  const readTime = String(body.readTime ?? "").trim();
  const content = String(body.content ?? "");
  const productSlugs = Array.isArray(body.productSlugs)
    ? body.productSlugs.map(String)
    : [];
  const published = body.published !== false;

  if (!id || !title || !excerpt || !category || !image) {
    return null;
  }
  // slug فقط حروف انگلیسی، عدد و خط تیره
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error("شناسه مقاله فقط می‌تواند حروف انگلیسی کوچک، عدد و خط تیره باشد.");
  }
  return { id, title, excerpt, category, date, image, readTime, content, productSlugs, published };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const body = await request.json();
    const data = parseBody(body);
    if (!data) {
      return NextResponse.json({ error: "فیلدهای ضروری (شناسه، عنوان، خلاصه، دسته، تصویر) را کامل کنید." }, { status: 400 });
    }
    const exists = await prisma.article.findUnique({ where: { id: data.id } });
    if (exists) {
      return NextResponse.json({ error: "مقاله‌ای با این شناسه قبلاً ثبت شده است." }, { status: 409 });
    }
    const article = await prisma.article.create({
      data: {
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        date: data.date || new Date().toLocaleDateString("fa-IR"),
        image: data.image,
        readTime: data.readTime || "۵ دقیقه",
        content: data.content,
        productSlugs: data.productSlugs,
        published: data.published,
      },
    });
    return NextResponse.json({ article });
  } catch (err) {
    console.error("[admin/articles]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "خطا در ایجاد مقاله" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    const data = parseBody(body);
    if (!data) {
      return NextResponse.json({ error: "فیلدهای ضروری را کامل کنید." }, { status: 400 });
    }
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        date: data.date,
        image: data.image,
        readTime: data.readTime,
        content: data.content,
        productSlugs: data.productSlugs,
        published: data.published,
      },
    });
    return NextResponse.json({ article });
  } catch (err) {
    console.error("[admin/articles]", err);
    return NextResponse.json({ error: "خطا در به‌روزرسانی مقاله" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف مقاله" }, { status: 400 });
  }
}

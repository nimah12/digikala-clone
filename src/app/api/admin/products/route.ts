import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slugify";
import { getFinalPrice } from "@/lib/format";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");

  const products = await prisma.product.findMany({
    where: categorySlug
      ? { category: { is: { slug: categorySlug } } }
      : undefined,
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      originalPrice: true,
      discountPercent: true,
      salesCount: true,
      stock: true,
      category: { select: { slug: true, name: true } },
      subcategory: { select: { slug: true, name: true } },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  let slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const categorySlug =
    typeof body.categorySlug === "string" ? body.categorySlug.trim() : "";
  const subcategorySlug =
    typeof body.subcategorySlug === "string" ? body.subcategorySlug.trim() : "";
  const imageUrl =
    typeof body.imageUrl === "string" && body.imageUrl.trim()
      ? body.imageUrl.trim()
      : null;
  const description =
    typeof body.description === "string" ? body.description.trim() : null;
  // «قیمت» در فرم پنل ادمین، قیمت اصلی (قبل از تخفیف) است؛
  // قیمت نهایی با کسر ٪ تخفیف محاسبه و در دیتابیس ذخیره می‌شود.
  const originalPrice = Number(body.originalPrice ?? body.price);
  const stock = Number.isInteger(body.stock) ? body.stock : 0;
  const discountPercent = Number.isInteger(body.discountPercent)
    ? body.discountPercent
    : 0;
  // سایزها: آرایه‌ای از { name, stock }
  const sizes: { name: string; stock: number }[] = Array.isArray(body.sizes)
    ? body.sizes
        .map((s: unknown) => {
          const row = s as { name?: unknown; stock?: unknown };
          const name = typeof row?.name === "string" ? row.name.trim() : "";
          const stock = Number.isInteger(row?.stock) ? (row.stock as number) : 0;
          return name ? { name, stock: Math.max(0, stock) } : null;
        })
        .filter((s: { name: string; stock: number } | null): s is { name: string; stock: number } => s !== null)
    : [];

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // اسلاگ خودکار از اسم فارسی؛ دستی هم قابل تایپ است
  if (!slug) slug = slugify(name);
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "slug must contain only English letters, numbers and dashes" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(originalPrice) || originalPrice < 0) {
    return NextResponse.json({ error: "invalid price" }, { status: 400 });
  }
  if (stock < 0) {
    return NextResponse.json({ error: "stock cannot be negative" }, { status: 400 });
  }
  if (discountPercent < 0 || discountPercent > 100) {
    return NextResponse.json(
      { error: "discountPercent must be between 0 and 100" },
      { status: 400 }
    );
  }
  if (imageUrl && !imageUrl.startsWith("http")) {
    return NextResponse.json({ error: "invalid imageUrl" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) {
    return NextResponse.json({ error: "category not found" }, { status: 400 });
  }

  let subcategoryId: number | null = null;
  if (subcategorySlug) {
    const sub = await prisma.subcategory.findUnique({
      where: { slug: subcategorySlug },
    });
    if (!sub || sub.categoryId !== category.id) {
      return NextResponse.json(
        { error: "subcategory not found for this category" },
        { status: 400 }
      );
    }
    subcategoryId = sub.id;
  }

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    // در صورت برخورد اسلاگ، یک پسوند عددی به‌طور خودکار اضافه کن
    let candidate = slug;
    let i = 2;
    while (
      await prisma.product.findUnique({ where: { slug: candidate } })
    ) {
      candidate = `${slug}-${i++}`;
    }
    slug = candidate;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: getFinalPrice(originalPrice, discountPercent),
      originalPrice,
      stock,
      discountPercent,
      imageUrl,
      categoryId: category.id,
      subcategoryId,
      sizes: {
        create: sizes.map((s, i) => ({
          name: s.name,
          stock: s.stock,
          order: i,
        })),
      },
    },
  });

  return NextResponse.json({ product });
}

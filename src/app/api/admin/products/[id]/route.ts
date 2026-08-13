import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getFinalPrice } from "@/lib/format";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { id: true, slug: true, name: true } },
      subcategory: { select: { id: true, slug: true, name: true } },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
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
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "invalid product id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.imageUrl !== undefined) {
    if (body.imageUrl !== null && !body.imageUrl.startsWith("http")) {
      return NextResponse.json({ error: "invalid imageUrl" }, { status: 400 });
    }
    data.imageUrl = body.imageUrl || null;
  }

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    data.name = name;
  }

  if (body.slug !== undefined) {
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "slug must contain only English letters, numbers and dashes" },
        { status: 400 }
      );
    }
    const existing = await prisma.product.findFirst({
      where: { slug, NOT: { id: productId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "a product with this slug already exists" },
        { status: 409 }
      );
    }
    data.slug = slug;
  }

  if (body.description !== undefined) {
    data.description =
      typeof body.description === "string" ? body.description.trim() || null : null;
  }

  // قیمت اصلی (قبل از تخفیف) از پنل ادمین می‌آید؛ قیمت نهایی با کسر ٪ تخفیف محاسبه می‌شود.
  // برای سازگاری با فراخوان‌های قبلی، ارسال مستقیم price هم مثل قبل رفتار می‌کند.
  let newOriginalPrice: number | null = null;
  if (body.originalPrice !== undefined) {
    const original = Number(body.originalPrice);
    if (!Number.isFinite(original) || original < 0) {
      return NextResponse.json({ error: "invalid originalPrice" }, { status: 400 });
    }
    newOriginalPrice = original;
  } else if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "invalid price" }, { status: 400 });
    }
    data.price = price;
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "invalid stock" }, { status: 400 });
    }
    data.stock = stock;
  }

  if (body.discountPercent !== undefined) {
    const discountPercent = Number(body.discountPercent);
    if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json({ error: "invalid discountPercent" }, { status: 400 });
    }
    data.discountPercent = discountPercent;
  }

  if (newOriginalPrice !== null) {
    const current = await prisma.product.findUnique({
      where: { id: productId },
      select: { discountPercent: true },
    });
    const discount =
      (data.discountPercent as number | undefined) ??
      current?.discountPercent ??
      0;
    data.originalPrice = newOriginalPrice;
    data.price = getFinalPrice(newOriginalPrice, discount);
  }

  // تغییر دسته/ساب‌دسته
  if (body.categorySlug !== undefined || body.subcategorySlug !== undefined) {
    const current = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });
    if (!current) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    let categoryId = current.categoryId;
    if (body.categorySlug !== undefined) {
      const cat = await prisma.category.findUnique({
        where: { slug: body.categorySlug },
      });
      if (!cat) {
        return NextResponse.json({ error: "category not found" }, { status: 400 });
      }
      categoryId = cat.id;
      data.categoryId = categoryId;
    }

    if (body.subcategorySlug !== undefined) {
      const subSlug = body.subcategorySlug;
      if (subSlug === null || subSlug === "") {
        data.subcategoryId = null;
      } else {
        const sub = await prisma.subcategory.findUnique({ where: { slug: subSlug } });
        if (!sub || sub.categoryId !== categoryId) {
          return NextResponse.json(
            { error: "subcategory not found for this category" },
            { status: 400 }
          );
        }
        data.subcategoryId = sub.id;
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data,
    include: {
      category: { select: { slug: true, name: true } },
      subcategory: { select: { slug: true, name: true } },
    },
  });

  return NextResponse.json({ product: updated });
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
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  // حذف کامل محصول حتی اگر در سفارش‌های قبلی استفاده شده باشد.
  // اقلام سفارش به محصول وابسته نمی‌مانند (productId → null با ON DELETE SET NULL)
  // و نام/عکس/اسلاگِ snapshot در OrderItem تاریخچه سفارش را حفظ می‌کند.
  const safeDeleteMany = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code !== "P2021" && code !== "P2025") throw e;
    }
  };

  await safeDeleteMany(() =>
    prisma.productMedia.deleteMany({ where: { productId } })
  );
  await safeDeleteMany(() =>
    prisma.productColor.deleteMany({ where: { productId } })
  );

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId } }),
    prisma.review.deleteMany({ where: { productId } }),
    prisma.vendor.deleteMany({ where: { productId } }),
    prisma.product.delete({ where: { id: productId } }),
  ]);

  return NextResponse.json({ ok: true });
}

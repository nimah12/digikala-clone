import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

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

  const sizes = await prisma.productSize.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ sizes });
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

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const stock = Number.isInteger(body.stock) ? body.stock : 0;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (stock < 0) {
    return NextResponse.json({ error: "stock cannot be negative" }, { status: 400 });
  }

  const lastSize = await prisma.productSize.findFirst({
    where: { productId },
    orderBy: { order: "desc" },
  });
  const nextOrder = (lastSize?.order ?? -1) + 1;

  const size = await prisma.productSize.create({
    data: { productId, name, stock, order: nextOrder },
  });

  return NextResponse.json({ size });
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
  const sizeId = Number(searchParams.get("sizeId"));
  if (!Number.isInteger(sizeId)) {
    return NextResponse.json({ error: "invalid sizeId" }, { status: 400 });
  }

  const size = await prisma.productSize.findUnique({ where: { id: sizeId } });
  if (!size || size.productId !== productId) {
    return NextResponse.json({ error: "size not found" }, { status: 404 });
  }

  await prisma.productSize.delete({ where: { id: sizeId } });

  return NextResponse.json({ ok: true });
}

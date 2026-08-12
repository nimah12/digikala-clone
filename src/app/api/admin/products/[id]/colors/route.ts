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

  const colors = await prisma.productColor.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ colors });
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
  const hex = typeof body.hex === "string" ? body.hex.trim() : "";
  const stock = Number.isInteger(body.stock) ? body.stock : 0;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return NextResponse.json(
      { error: "hex must be a valid color like #000000" },
      { status: 400 }
    );
  }
  if (stock < 0) {
    return NextResponse.json({ error: "stock cannot be negative" }, { status: 400 });
  }

  const lastColor = await prisma.productColor.findFirst({
    where: { productId },
    orderBy: { order: "desc" },
  });
  const nextOrder = (lastColor?.order ?? -1) + 1;

  const color = await prisma.productColor.create({
    data: { productId, name, hex, stock, order: nextOrder },
  });

  return NextResponse.json({ color });
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
  const colorId = Number(searchParams.get("colorId"));
  if (!Number.isInteger(colorId)) {
    return NextResponse.json({ error: "invalid colorId" }, { status: 400 });
  }

  const color = await prisma.productColor.findUnique({ where: { id: colorId } });
  if (!color || color.productId !== productId) {
    return NextResponse.json({ error: "color not found" }, { status: 404 });
  }

  await prisma.productColor.delete({ where: { id: colorId } });

  return NextResponse.json({ ok: true });
}

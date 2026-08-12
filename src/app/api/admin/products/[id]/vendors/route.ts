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

  const vendors = await prisma.vendor.findMany({ where: { productId } });
  return NextResponse.json({ vendors });
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

  const vendorId = Number(body.vendorId);
  if (!Number.isInteger(vendorId)) {
    return NextResponse.json({ error: "invalid vendorId" }, { status: 400 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor || vendor.productId !== productId) {
    return NextResponse.json({ error: "vendor not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return NextResponse.json({ error: "rating must be between 0 and 5" }, { status: 400 });
    }
    data.rating = rating;
  }
  if (body.price !== undefined) {
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
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    data.name = name;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const updated = await prisma.vendor.update({ where: { id: vendorId }, data });

  return NextResponse.json({ vendor: updated });
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
  const vendorId = Number(searchParams.get("vendorId"));
  if (!Number.isInteger(vendorId)) {
    return NextResponse.json({ error: "invalid vendorId" }, { status: 400 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor || vendor.productId !== productId) {
    return NextResponse.json({ error: "vendor not found" }, { status: 404 });
  }

  await prisma.vendor.delete({ where: { id: vendorId } });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// وضعیت‌هایی که در آن‌ها موجودی قبلاً کسر شده است (برای بازگردانی هنگام لغو)
const STOCK_DEDUCTED_STATUSES = ["processing", "shipped", "delivered"];

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const orders = await prisma.order.findMany({
    where: {
      ...(status && status !== "all" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { id: Number.isInteger(Number(q)) ? Number(q) : -1 },
              { receiverName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          colorName: true,
          sizeName: true,
          productName: true,
          productSlug: true,
          productImageUrl: true,
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const orderId = Number(body.orderId);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "invalid orderId" }, { status: 400 });
  }

  const status = body.status;
  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "invalid status" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  const oldStatus = order.status;
  if (status === oldStatus) {
    return NextResponse.json({
      order: { id: order.id, status, total: order.total, createdAt: order.createdAt },
    });
  }

  // تایید سفارش توسط ادمین: کسر موجودی و ثبت فروش موفق
  const approving = status === "processing" && oldStatus === "pending";
  // لغو سفارشی که قبلاً تایید شده: بازگردانی موجودی و فروش
  const cancelling =
    status === "cancelled" && STOCK_DEDUCTED_STATUSES.includes(oldStatus);

  if (approving || cancelling) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productId === null) continue;
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) continue;

        if (approving) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: Math.max(0, product.stock - item.quantity),
              salesCount: product.salesCount + item.quantity,
            },
          });
          if (item.colorName) {
            await tx.productColor.updateMany({
              where: { productId: product.id, name: item.colorName },
              data: { stock: { decrement: item.quantity } },
            });
          }
          if (item.sizeName) {
            await tx.productSize.updateMany({
              where: { productId: product.id, name: item.sizeName },
              data: { stock: { decrement: item.quantity } },
            });
          }
        } else {
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: product.stock + item.quantity,
              salesCount: Math.max(0, product.salesCount - item.quantity),
            },
          });
          if (item.colorName) {
            await tx.productColor.updateMany({
              where: { productId: product.id, name: item.colorName },
              data: { stock: { increment: item.quantity } },
            });
          }
          if (item.sizeName) {
            await tx.productSize.updateMany({
              where: { productId: product.id, name: item.sizeName },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
      await tx.order.update({ where: { id: orderId }, data: { status } });
    });
  } else {
    await prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, total: true, createdAt: true },
  });

  return NextResponse.json({ order: updated });
}

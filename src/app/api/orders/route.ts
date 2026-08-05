import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return Response.json({ success: false, error: "email required" }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { user: { email } },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ success: true, data: orders });
  } catch {
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, total, shippingName, shippingPrice, receiverName, phone, address, productIds, quantities } = body;

    if (!email || !Array.isArray(productIds) || productIds.length === 0) {
      return Response.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }

    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length === 0) {
      return Response.json({ success: false, error: "محصولی یافت نشد" }, { status: 404 });
    }

    const qtyMap = new Map<number, number>();
    if (Array.isArray(quantities)) {
      productIds.forEach((id: number, i: number) => qtyMap.set(id, quantities[i] || 1));
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "pending",
        total,
        shippingName,
        shippingPrice,
        receiverName,
        phone,
        address,
        items: {
          create: products.map((p) => ({
            productId: p.id,
            quantity: Math.min(qtyMap.get(p.id) || 1, p.stock || 1),
            price: p.price,
          })),
        },
      },
    });

    return Response.json({ success: true, orderId: order.id });
  } catch (e: unknown) {
    console.error("ORDER ERROR:", e);
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

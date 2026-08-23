import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = readAuthToken(request);
  if (!userId) {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
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
    const {
      email,
      total,
      shippingName,
      shippingPrice,
      receiverName,
      phone,
      address,
      productIds,
      quantities,
      colorNames,
      colorHexes,
      sizeNames,
      deliveryDay,
      deliverySlot,
    } = body;

    if (!email || !Array.isArray(productIds) || productIds.length === 0) {
      return Response.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const userId = readAuthToken(request);
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }
    if (!user) {
      return Response.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }

    const uniqueIds = [...new Set(productIds as number[])];
    const products = await prisma.product.findMany({ where: { id: { in: uniqueIds } } });
    if (products.length === 0) {
      return Response.json({ success: false, error: "محصولی یافت نشد" }, { status: 404 });
    }
    const productById = new Map(products.map((p) => [p.id, p]));

    // هر ردیف از سبد خرید (نه هر محصولِ یکتا) به یک OrderItem تبدیل می‌شود؛
    // این‌طوری همان محصول با رنگ‌های مختلف، ردیف‌های جداگانه در سفارش باقی می‌ماند.
    // name/slug/imageUrl به‌عنوان snapshot ذخیره می‌شوند تا پس از حذف کامل محصول،
    // تاریخچه سفارش همچنان قابل نمایش باشد.
    const itemsData = (productIds as number[])
      .map((pid, i) => {
        const p = productById.get(pid);
        if (!p) return null;
        // محصول ناموجود قابل خرید نیست
        if (p.stock <= 0) return null;
        const quantity = Math.min(
          Array.isArray(quantities) ? quantities[i] || 1 : 1,
          p.stock
        );
        if (quantity <= 0) return null;
        return {
          productId: p.id,
          quantity,
          price: p.price,
          productName: p.name,
          productSlug: p.slug,
          productImageUrl: p.imageUrl,
          colorName: Array.isArray(colorNames) ? colorNames[i] || null : null,
          colorHex: Array.isArray(colorHexes) ? colorHexes[i] || null : null,
          sizeName: Array.isArray(sizeNames) ? sizeNames[i] || null : null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (itemsData.length === 0) {
      return Response.json({ success: false, error: "محصولی یافت نشد" }, { status: 404 });
    }

    const deliveryInfo =
      deliveryDay && deliverySlot
        ? `${address} — تحویل: ${deliveryDay}، بازه ${deliverySlot}`
        : address;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        // پرداخت در این دمو همیشه موفق است؛ سفارش در انتظار تایید ادمین قرار می‌گیرد
        // و موجودی/فروش فقط پس از تایید (pending → processing) کسر/ثبت می‌شود
        status: "pending",
        total,
        shippingName,
        shippingPrice,
        receiverName,
        phone,
        address: deliveryInfo,
        items: { create: itemsData },
      },
    });

    return Response.json({ success: true, orderId: order.id });
  } catch (e: unknown) {
    console.error("ORDER ERROR:", e);
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

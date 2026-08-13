import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readAuthToken } from "@/lib/auth";

// ثبت امتیاز و دیدگاه برای یک سفارش تحویل‌شده
export async function POST(request: NextRequest) {
  const userId = readAuthToken(request);
  if (!userId) {
    return Response.json({ success: false, error: "ابتدا وارد حساب شوید" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, rating, comment } = body;

    const ratingNum = Number(rating);
    if (!orderId || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return Response.json({ success: false, error: "امتیاز معتبر نیست (۱ تا ۵)" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), userId },
      include: {
        items: { take: 1, include: { product: { select: { id: true, name: true, rating: true, ratingCount: true } } } },
        user: { select: { name: true } },
      },
    });

    if (!order || order.items.length === 0) {
      return Response.json({ success: false, error: "سفارش یافت نشد" }, { status: 404 });
    }

    const product = order.items[0].product;
    if (!product) {
      return Response.json({ success: false, error: "محصول این سفارش حذف شده است" }, { status: 404 });
    }
    const date = new Date().toLocaleDateString("fa-IR");

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        author: order.user.name || "کاربر دیجی‌کلون",
        date,
        rating: ratingNum,
        title:
          ratingNum >= 4 ? "بسیار راضی بودم" : ratingNum === 3 ? "خرید معمولی" : "راضی نبودم",
        text: comment?.trim() || "بدون توضیح",
      },
    });

    // به‌روزرسانی میانگین امتیاز محصول
    const productAgg = await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: {
          set: Math.round(((product.rating * product.ratingCount + ratingNum) / (product.ratingCount + 1)) * 10) / 10,
        },
        ratingCount: { increment: 1 },
      },
      select: { rating: true, ratingCount: true },
    });

    return Response.json({
      success: true,
      review,
      product: { id: product.id, rating: productAgg.rating, ratingCount: productAgg.ratingCount },
    });
  } catch (e: unknown) {
    console.error("REVIEW ERROR:", e);
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

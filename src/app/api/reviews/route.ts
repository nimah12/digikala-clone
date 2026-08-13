import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readAuthToken } from "@/lib/auth";

// وضعیت سفارشی که «به پایان رسیده» است و خریدار اجازه‌ی ثبت دیدگاه دارد
const COMPLETED_STATUS = "delivered";

// آیا کاربرِ واردشده اجازه‌ی دیدگاه دادن به این محصول را دارد؟
// فقط خریدارِ محصولی که سفارشش تحویل شده است.
export async function GET(request: NextRequest) {
  const userId = readAuthToken(request);
  const { searchParams } = new URL(request.url);
  const productId = Number(searchParams.get("productId"));

  if (!userId) {
    return Response.json({ success: true, canReview: false, reason: "not-logged-in" });
  }
  if (!Number.isInteger(productId)) {
    return Response.json({ success: true, canReview: false, reason: "invalid-product" });
  }

  try {
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: COMPLETED_STATUS },
      },
      select: { id: true },
    });

    if (!purchased) {
      // ممکن است محصول را خریده باشد ولی سفارش هنوز تحویل نشده
      const anyPurchase = await prisma.orderItem.findFirst({
        where: { productId, order: { userId } },
        select: { id: true },
      });
      return Response.json({
        success: true,
        canReview: false,
        reason: anyPurchase ? "not-delivered" : "not-purchased",
      });
    }

    const alreadyReviewed = await prisma.review.findFirst({
      where: { productId, userId },
      select: { id: true },
    });

    return Response.json({
      success: true,
      canReview: !alreadyReviewed,
      alreadyReviewed: !!alreadyReviewed,
    });
  } catch {
    return Response.json({ success: true, canReview: false, reason: "error" });
  }
}

// ثبت امتیاز و دیدگاه — فقط برای خریدارِ سفارش تحویل‌شده
export async function POST(request: NextRequest) {
  const userId = readAuthToken(request);
  if (!userId) {
    return Response.json({ success: false, error: "ابتدا وارد حساب شوید" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, rating, comment, productId, title } = body;

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return Response.json({ success: false, error: "امتیاز معتبر نیست (۱ تا ۵)" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });
    if (!user) {
      return Response.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }

    let productIdToReview: number | null = null;

    // مسیر ۱: از صفحه محصول — فقط اگر خریدارِ سفارش تحویل‌شده باشد
    if (productId !== undefined && productId !== null) {
      productIdToReview = Number(productId);
      if (!Number.isInteger(productIdToReview)) {
        return Response.json({ success: false, error: "محصول نامعتبر است" }, { status: 400 });
      }

      const purchased = await prisma.orderItem.findFirst({
        where: {
          productId: productIdToReview,
          order: { userId, status: COMPLETED_STATUS },
        },
        select: { id: true },
      });
      if (!purchased) {
        return Response.json(
          { success: false, error: "فقط خریداران این محصول می‌توانند دیدگاه ثبت کنند" },
          { status: 403 }
        );
      }
    } else if (orderId) {
      // مسیر ۲: از صفحه‌ی سفارش — سفارش متعلق به کاربر و تحویل‌شده باشد
      const order = await prisma.order.findFirst({
        where: { id: Number(orderId), userId },
        include: { items: { take: 1 } },
      });
      if (!order || order.items.length === 0) {
        return Response.json({ success: false, error: "سفارش یافت نشد" }, { status: 404 });
      }
      if (order.status !== COMPLETED_STATUS) {
        return Response.json(
          { success: false, error: "این سفارش هنوز تحویل نشده است" },
          { status: 403 }
        );
      }
      productIdToReview = order.items[0].productId;
    } else {
      return Response.json(
        { success: false, error: "orderId یا productId الزامی است" },
        { status: 400 }
      );
    }

    if (productIdToReview === null) {
      return Response.json({ success: false, error: "محصول یافت نشد" }, { status: 404 });
    }

    // جلوگیری از دیدگاه تکراری برای همان محصول توسط همان کاربر
    const existing = await prisma.review.findFirst({
      where: { productId: productIdToReview, userId },
      select: { id: true },
    });
    if (existing) {
      return Response.json(
        { success: false, error: "شما قبلاً برای این محصول دیدگاه ثبت کرده‌اید" },
        { status: 409 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productIdToReview },
      select: { id: true, rating: true, ratingCount: true },
    });
    if (!product) {
      return Response.json({ success: false, error: "محصول یافت نشد" }, { status: 404 });
    }

    const date = new Date().toLocaleDateString("fa-IR");
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        author: user.name || "کاربر دیجی‌کلون",
        date,
        rating: ratingNum,
        title:
          typeof title === "string" && title.trim()
            ? title.trim()
            : ratingNum >= 4
              ? "بسیار راضی بودم"
              : ratingNum === 3
                ? "خرید معمولی"
                : "راضی نبودم",
        text: comment?.trim() || "بدون توضیح",
        // چون فقط خریدارِ سفارش تحویل‌شده می‌تواند دیدگاه ثبت کند، همیشه تأییدشده است
        verified: true,
      },
    });

    // به‌روزرسانی میانگین امتیاز محصول
    const productAgg = await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: {
          set:
            Math.round(((product.rating * product.ratingCount + ratingNum) / (product.ratingCount + 1)) * 10) / 10,
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

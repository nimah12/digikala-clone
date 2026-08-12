import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// این روت چند تا محصول واقعی رو برمی‌گردونه تا برای ساخت پیام‌های
// «نظرسنجی کالا» تو صفحه پیام‌ها استفاده بشن. اگر ایمیل کاربر داده بشه،
// اول از محصولات سفارش‌های اون کاربر استفاده می‌کنیم، وگرنه چندتا از
// جدیدترین محصولات فروشگاه رو برمی‌گردونیم.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  try {
    if (email) {
      const orderItems = await prisma.orderItem.findMany({
        where: { order: { user: { email } } },
        orderBy: { id: "desc" },
        take: 4,
        select: {
          product: {
            select: { id: true, name: true, slug: true, imageUrl: true },
          },
        },
      });

      if (orderItems.length > 0) {
        return Response.json({
          success: true,
          data: orderItems.map((item: (typeof orderItems)[number]) => item.product),
        });
      }
    }

    const products = await prisma.product.findMany({
      orderBy: { id: "desc" },
      take: 4,
      select: { id: true, name: true, slug: true, imageUrl: true },
    });

    return Response.json({ success: true, data: products });
  } catch {
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

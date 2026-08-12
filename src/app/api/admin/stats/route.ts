import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [
    productCount,
    categoryCount,
    subcategoryCount,
    groupCount,
    lowStock,
    userCount,
    orderCount,
    revenue,
    reviewCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count({ where: { parentId: null } }),
    prisma.category.count({ where: { parentId: { not: null } } }),
    prisma.menuGroup.count(),
    prisma.product.count({ where: { stock: { lte: 3 } } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "cancelled" } },
    }),
    prisma.review.count(),
  ]);

  return NextResponse.json({
    stats: {
      productCount,
      categoryCount,
      subcategoryCount,
      groupCount,
      lowStock,
      userCount,
      orderCount,
      revenue: revenue._sum.total ?? 0,
      reviewCount,
    },
  });
}

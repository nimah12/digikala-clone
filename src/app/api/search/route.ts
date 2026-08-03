import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return Response.json({ success: true, data: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        // جستجو در slug هم اجازه می‌دهد با نام انگلیسی پیدا کنیم
        { slug: { contains: q.toLowerCase(), mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      imageUrl: true,
      discountPercent: true,
      category: { select: { name: true } },
    },
    take: 8,
  });

  return Response.json({ success: true, data: products });
}

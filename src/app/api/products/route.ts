import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return Response.json({ success: false, error: "ids required" }, { status: 400 });
  }
  const ids = idsParam.split(",").map(Number).filter(Boolean);
  if (ids.length === 0) {
    return Response.json({ success: true, data: [] });
  }
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, slug: true, price: true, imageUrl: true, stock: true, category: { select: { name: true } } },
    });
    return Response.json({ success: true, data: products });
  } catch {
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

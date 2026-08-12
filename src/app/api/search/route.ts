import { NextRequest } from "next/server";
import { searchProducts } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return Response.json({ success: true, data: [] });
  }

  const products = await searchProducts(q, 8);

  return Response.json({
    success: true,
    data: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      imageUrl: p.imageUrl,
      discountPercent: p.discountPercent,
      category: { name: p.category.name },
    })),
  });
}

import { prisma } from "@/lib/prisma";
import CartClient from "@/components/CartClient";

export default async function CartPage() {
  // همه محصولات برای نمایش در سبد (فیلتر در کلاینت)
  const products = await prisma.product.findMany({
    include: { category: true },
  });

  return <CartClient products={products} />;
}

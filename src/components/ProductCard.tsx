import Link from "next/link";
import Image from "next/image";
import type { Category, Product } from "@prisma/client";
import PriceBadge from "./PriceBadge";
import Rating from "./Rating";

export type ProductWithCategory = Product & { category: Category };

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="card-lift group block rounded-xl border overflow-hidden fade-in"
      style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ background: "var(--bg)" }}>
        <Image
          src={product.imageUrl || "/images/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {product.discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-dk-red text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-md pop-in">
            ٪{product.discountPercent.toLocaleString("fa-IR")}
          </span>
        )}
        {/* Quick view hint on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent pt-10 pb-2 flex justify-center">
          <span className="text-[10px] font-bold text-white">مشاهده محصول ←</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-xs leading-5 line-clamp-2 min-h-[40px] group-hover:text-dk-red transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <Rating rating={product.rating} ratingCount={product.ratingCount} />
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {product.salesCount.toLocaleString("fa-IR")} فروش
          </span>
        </div>
        <PriceBadge price={product.price} discountPercent={product.discountPercent} />
      </div>
    </Link>
  );
}

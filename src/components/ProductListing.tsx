import ProductCard, { type ProductWithCategory } from "./ProductCard";
import Icon, { type IconName } from "./Icon";

export default function ProductListing({
  icon,
  title,
  subtitle,
  products,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  products: ProductWithCategory[];
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-dk-red"><Icon name={icon} size={24} /></span>
        <h1 className="text-lg font-extrabold">
          {title}
          <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
            {" "}
            ({products.length.toLocaleString("fa-IR")} کالا)
          </span>
        </h1>
      </div>
      {subtitle && (
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
      )}

      {products.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--text-secondary)" }}>
          در حال حاضر کالایی در این بخش وجود ندارد.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

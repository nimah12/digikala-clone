"use client";

import type { CategoryOption, Product, TreeCategory } from "./types";
import GalleryManager from "./GalleryManager";
import ColorManager from "./ColorManager";
import ProductEditPanel from "./ProductEditPanel";

type Props = {
  product: Product;
  categoryOptions: CategoryOption[];
  catTree: TreeCategory[];
  uploading: boolean;
  deleting: boolean;
  deletingImage: boolean;
  galleryOpen: boolean;
  colorOpen: boolean;
  editOpen: boolean;
  onUploadImage: (file: File) => void;
  onDeleteImage: () => void;
  onDelete: () => void;
  onToggleGallery: () => void;
  onToggleColor: () => void;
  onToggleEdit: () => void;
  onEditSaved: () => void;
};

export default function ProductListRow({
  product,
  categoryOptions,
  catTree,
  uploading,
  deleting,
  deletingImage,
  galleryOpen,
  colorOpen,
  editOpen,
  onUploadImage,
  onDeleteImage,
  onDelete,
  onToggleGallery,
  onToggleColor,
  onToggleEdit,
  onEditSaved,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              background: "#f2f2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#999",
              borderRadius: 6,
            }}
          >
            بدون عکس
          </div>
        )}
        <div style={{ flex: 1 }}>
          <a
            href={`/product/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              marginBottom: 6,
              fontWeight: 700,
              color: "#23254e",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {product.name}
          </a>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
            {product.discountPercent > 0 && product.originalPrice ? (
              <>
                <span style={{ textDecoration: "line-through", opacity: 0.65 }}>
                  {product.originalPrice.toLocaleString("fa-IR")}
                </span>{" "}
                <span style={{ fontWeight: 700 }}>
                  {product.price.toLocaleString("fa-IR")} تومان
                </span>{" "}
                <span style={{ color: "#c0392b" }}>
                  (٪{product.discountPercent.toLocaleString("fa-IR")})
                </span>
              </>
            ) : (
              <>
                {product.price.toLocaleString("fa-IR")} تومان
                {product.discountPercent > 0
                  ? ` (٪${product.discountPercent.toLocaleString("fa-IR")})`
                  : ""}
              </>
            )}{" "}
            • فروش: {product.salesCount.toLocaleString("fa-IR")} • موجودی:{" "}
            {product.stock.toLocaleString("fa-IR")}
            {product.subcategory ? ` • ${product.subcategory.name}` : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(file);
              }}
            />
            {uploading && (
              <span style={{ fontSize: 13, color: "#555" }}>
                در حال آپلود...
              </span>
            )}
            {product.imageUrl && (
              <button
                type="button"
                onClick={onDeleteImage}
                disabled={deletingImage}
                style={{
                  fontSize: 13,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #c0392b",
                  background: "#fff",
                  color: "#c0392b",
                  cursor: "pointer",
                }}
              >
                {deletingImage ? "در حال حذف..." : "حذف عکس"}
              </button>
            )}
            <button
              type="button"
              onClick={onToggleGallery}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: galleryOpen ? "#eee" : "#fff",
                cursor: "pointer",
              }}
            >
              {galleryOpen ? "بستن گالری" : "مدیریت گالری عکس/ویدیو"}
            </button>
            <button
              type="button"
              onClick={onToggleColor}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: colorOpen ? "#eee" : "#fff",
                cursor: "pointer",
              }}
            >
              {colorOpen ? "بستن رنگ‌ها" : "مدیریت رنگ‌ها"}
            </button>
            <button
              type="button"
              onClick={onToggleEdit}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: editOpen ? "#eee" : "#fff",
                cursor: "pointer",
              }}
            >
              {editOpen ? "بستن ویرایش" : "ویرایش محصول"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #c0392b",
                background: "#fff",
                color: "#c0392b",
                cursor: "pointer",
              }}
            >
              {deleting ? "در حال حذف..." : "حذف محصول"}
            </button>
          </div>
        </div>
      </div>

      {galleryOpen && <GalleryManager productId={product.id} />}

      {colorOpen && <ColorManager productId={product.id} />}

      {editOpen && (
        <ProductEditPanel
          productId={product.id}
          categoryOptions={categoryOptions}
          catTree={catTree}
          onSaved={onEditSaved}
        />
      )}
    </div>
  );
}

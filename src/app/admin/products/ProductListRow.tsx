"use client";

import type { CategoryOption, MoveResult, Product, TreeCategory } from "./types";
import { SafeImg } from "@/components/SafeImage";
import GalleryManager from "./GalleryManager";
import ColorManager from "./ColorManager";
import ProductEditPanel from "./ProductEditPanel";
import MoveProductPanel from "./MoveProductPanel";

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
  moveOpen: boolean;
  onUploadImage: (file: File) => void;
  onDeleteImage: () => void;
  onDelete: () => void;
  onToggleGallery: () => void;
  onToggleColor: () => void;
  onToggleEdit: () => void;
  onToggleMove: () => void;
  onEditSaved: () => void;
  onMoved: (result: MoveResult) => void;
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
  moveOpen,
  onUploadImage,
  onDeleteImage,
  onDelete,
  onToggleGallery,
  onToggleColor,
  onToggleEdit,
  onToggleMove,
  onEditSaved,
  onMoved,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
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
          <SafeImg
            src={product.imageUrl}
            alt={product.name}
            style={{ width: 80, height: 80, objectFit: "contain", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              background: "var(--hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "var(--text-muted)",
              borderRadius: 6,
            }}
          >
            بدون عکس
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
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
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
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
              id={`product-image-${product.id}`}
              name={`product-image-${product.id}`}
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(file);
              }}
              style={{ minWidth: 0, maxWidth: 180 }}
            />
            {uploading && (
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
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
                  background: "var(--panel)",
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
                border: "1px solid var(--border)",
                background: galleryOpen ? "var(--hover)" : "var(--panel)",
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
                border: "1px solid var(--border)",
                background: colorOpen ? "var(--hover)" : "var(--panel)",
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
                border: "1px solid var(--border)",
                background: editOpen ? "var(--hover)" : "var(--panel)",
                cursor: "pointer",
              }}
            >
              {editOpen ? "بستن ویرایش" : "ویرایش محصول"}
            </button>
            <button
              type="button"
              onClick={onToggleMove}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: moveOpen ? "var(--hover)" : "var(--panel)",
                cursor: "pointer",
              }}
            >
              {moveOpen ? "بستن انتقال" : "انتقال به دسته دیگر"}
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
                background: "var(--panel)",
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

      {moveOpen && (
        <MoveProductPanel
          productId={product.id}
          productName={product.name}
          currentCategorySlug={product.category?.slug ?? null}
          currentSubcategorySlug={product.subcategory?.slug ?? null}
          categoryOptions={categoryOptions}
          catTree={catTree}
          onMoved={onMoved}
          onClose={onToggleMove}
        />
      )}
    </div>
  );
}

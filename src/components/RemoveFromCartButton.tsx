"use client";

import { useTransition } from "react";
import { removeFromCart } from "@/lib/actions";

export default function RemoveFromCartButton({ productId }: { productId: number }) {
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      await removeFromCart(productId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={pending}
      className="shrink-0 w-9 h-9 rounded-lg hover:bg-dk-red/10 hover:text-dk-red transition-colors flex items-center justify-center"
      style={{ color: "var(--text-secondary)" }}
      aria-label="حذف از سبد"
      title="حذف از سبد"
    >
      {pending ? (
        <span className="w-4 h-4 border-2 border-dk-red border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )}
    </button>
  );
}

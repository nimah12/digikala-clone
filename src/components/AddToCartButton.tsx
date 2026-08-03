"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions";

export default function AddToCartButton({ productId, slug }: { productId: number; slug: string }) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleClick() {
    startTransition(async () => {
      await addToCart(productId);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`btn-press w-full h-10 rounded-lg text-sm font-bold shadow-sm ${
        added
          ? "bg-dk-green text-white"
          : "bg-dk-red text-white hover:bg-dk-red-dark hover:shadow-md disabled:opacity-60"
      }`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          در حال افزودن...
        </span>
      ) : added ? (
        <span className="pop-in inline-block">به سبد اضافه شد ✓</span>
      ) : (
        "افزودن به سبد خرید"
      )}
    </button>
  );
}

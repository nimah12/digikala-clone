"use client";

import { useState } from "react";

type CartItem = { id: number; qty: number };

export default function AddToCartButton({ productId }: { productId: number }) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    try {
      const raw = localStorage.getItem("dk-cart");
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      const existing = items.find((i) => i.id === productId);
      if (existing) {
        existing.qty += 1;
      } else {
        items.push({ id: productId, qty: 1 });
      }
      localStorage.setItem("dk-cart", JSON.stringify(items));
      window.dispatchEvent(new Event("dk-cart-changed"));
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-press w-full h-10 rounded-lg text-sm font-bold shadow-sm transition-colors ${
        added
          ? "bg-dk-green text-white"
          : "bg-dk-red text-white hover:bg-dk-red-dark hover:shadow-md"
      }`}
    >
      {added ? (
        <span className="pop-in inline-block">به سبد اضافه شد ✓</span>
      ) : (
        "افزودن به سبد خرید"
      )}
    </button>
  );
}

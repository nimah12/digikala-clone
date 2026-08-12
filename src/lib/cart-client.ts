"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  id: number;
  qty: number;
  colorId?: number;
  colorName?: string;
  colorHex?: string;
};

const EMPTY_CART: CartItem[] = [];
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = [];

function getCartItemsSnapshot(): CartItem[] {
  if (typeof window === "undefined") return cachedItems;
  try {
    const raw = localStorage.getItem("dk-cart");
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    cachedItems = raw ? JSON.parse(raw) : [];
    return cachedItems;
  } catch {
    return cachedItems;
  }
}

function subscribeCart(cb: () => void) {
  window.addEventListener("dk-cart-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("dk-cart-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(
    subscribeCart,
    getCartItemsSnapshot,
    () => EMPTY_CART,
  );
}

export function useCartCount(initial = 0): number {
  const items = useCartItems();
  return items.reduce((sum, i) => sum + (i.qty || 1), 0) || initial;
}

export function addToCart(
  productId: number,
  color?: { id: number; name: string; hex: string },
) {
  try {
    const raw = localStorage.getItem("dk-cart");
    const items: CartItem[] = raw ? JSON.parse(raw) : [];
    const existing = items.find(
      (i) => i.id === productId && (i.colorId ?? null) === (color?.id ?? null),
    );
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: productId,
        qty: 1,
        ...(color
          ? { colorId: color.id, colorName: color.name, colorHex: color.hex }
          : {}),
      });
    }
    localStorage.setItem("dk-cart", JSON.stringify(items));
    window.dispatchEvent(new Event("dk-cart-changed"));
  } catch {}
}

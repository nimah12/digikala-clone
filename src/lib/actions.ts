"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CART_COOKIE } from "./cart";

function parseCart(raw: string | undefined): number[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === "number") : [];
  } catch {
    return [];
  }
}

export async function addToCart(productId: number) {
  const store = await cookies();
  const ids = parseCart(store.get(CART_COOKIE)?.value);
  if (!ids.includes(productId)) ids.push(productId);
  store.set(CART_COOKIE, JSON.stringify(ids), { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/", "layout");
}

export async function removeFromCart(productId: number) {
  const store = await cookies();
  const ids = parseCart(store.get(CART_COOKIE)?.value).filter((id) => id !== productId);
  store.set(CART_COOKIE, JSON.stringify(ids), { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/", "layout");
}

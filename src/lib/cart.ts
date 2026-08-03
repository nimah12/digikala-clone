import { cookies } from "next/headers";

export const CART_COOKIE = "dk-cart";

export async function getCartProductIds(): Promise<number[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const ids: unknown = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((x): x is number => typeof x === "number") : [];
  } catch {
    return [];
  }
}

export async function getCartCount(): Promise<number> {
  return (await getCartProductIds()).length;
}

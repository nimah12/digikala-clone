export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const CURRENCY = "IRR";

export type EcommerceItem = {
  item_id: number | string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
  index?: number;
};

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

export function pushEvent(
  event: string,
  data: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

function pushEcommerce(event: string, ecommerce: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // GA4 expects the ecommerce object to be cleared before each event
  // so items from previous events are not appended/duplicated.
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });
}

export function trackPageView(data: Record<string, unknown> = {}): void {
  pushEvent("pageview", data);
}

export function trackAddToCart(item: EcommerceItem): void {
  pushEcommerce("add_to_cart", {
    currency: CURRENCY,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(
  value: number,
  items: EcommerceItem[],
): void {
  pushEcommerce("begin_checkout", {
    currency: CURRENCY,
    value,
    items,
  });
}

export function trackPurchase(params: {
  transaction_id: number | string;
  value: number;
  shipping?: number;
  items: EcommerceItem[];
}): void {
  pushEcommerce("purchase", {
    transaction_id: params.transaction_id,
    currency: CURRENCY,
    value: params.value,
    shipping: params.shipping ?? 0,
    items: params.items,
  });
}

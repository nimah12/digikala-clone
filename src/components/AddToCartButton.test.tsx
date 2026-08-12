import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddToCartButton from "./AddToCartButton";

function setupStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  });
  return store;
}

beforeEach(() => {
  setupStorage();
  vi.restoreAllMocks();
});

describe("AddToCartButton", () => {
  it("adds product to empty cart", () => {
    render(<AddToCartButton productId={5} />);
    fireEvent.click(screen.getByRole("button"));
    expect(localStorage.getItem("dk-cart")).toBe(JSON.stringify([{ id: 5, qty: 1 }]));
  });

  it("increments quantity when product already in cart", () => {
    localStorage.setItem("dk-cart", JSON.stringify([{ id: 5, qty: 1 }]));
    render(<AddToCartButton productId={5} />);
    fireEvent.click(screen.getByRole("button"));
    expect(localStorage.getItem("dk-cart")).toBe(JSON.stringify([{ id: 5, qty: 2 }]));
  });

  it("dispatches dk-cart-changed event on add", () => {
    const spy = vi.fn();
    window.addEventListener("dk-cart-changed", spy);
    render(<AddToCartButton productId={5} />);
    fireEvent.click(screen.getByRole("button"));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect } from "vitest";
import { getShippingPrice, FREE_SHIPPING_PROVINCES, SHIPPING_METHODS } from "./CheckoutForm";

const express = SHIPPING_METHODS[0];

describe("getShippingPrice", () => {
  it("returns free shipping for Tehran and Alborz", () => {
    expect(FREE_SHIPPING_PROVINCES).toEqual(["تهران", "البرز"]);
    expect(getShippingPrice(express, "تهران")).toBe(0);
    expect(getShippingPrice(express, "البرز")).toBe(0);
  });

  it("charges the method price for other provinces", () => {
    expect(getShippingPrice(express, "اصفهان")).toBe(express.price);
    expect(getShippingPrice(express, "فارس")).toBe(30000);
  });
});
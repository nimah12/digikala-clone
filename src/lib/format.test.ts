import { describe, it, expect } from "vitest";
import { formatPrice, formatDiscountPercent, formatRating, formatSales } from "./format";

describe("format", () => {
  it("formats price with Persian digits and separators", () => {
    expect(formatPrice(32000000)).toBe("۳۲٬۰۰۰٬۰۰۰");
  });

  it("formats discount percent with Persian percent sign", () => {
    expect(formatDiscountPercent(15)).toBe("٪۱۵");
  });

  it("formats rating with Persian decimal separator", () => {
    expect(formatRating(4.7)).toBe("۴٫۷");
    expect(formatRating(5)).toBe("۵٫۰");
  });

  it("formats sales with unit", () => {
    expect(formatSales(987)).toBe("۹۸۷ فروش");
  });
});
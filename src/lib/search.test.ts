import { describe, it, expect } from "vitest";
import { faNormalize } from "./search";

describe("faNormalize", () => {
  it("unifies Arabic yeh and kaf to Persian", () => {
    expect(faNormalize("موبايل")).toBe("موبایل");
    expect(faNormalize("کتاب")).toBe("کتاب");
  });

  it("unifies alef variants and te marbuta", () => {
    expect(faNormalize("آبسیمان")).toBe("ابسیمان");
    expect(faNormalize("مدرسهٔ")).toBe("مدرسه");
  });

  it("strips diacritics, mixes digits, lowercases and trims", () => {
    expect(faNormalize("  تلفونَ  ")).toBe("تلفون");
    expect(faNormalize("IPhone")).toBe("iphone");
  });
});
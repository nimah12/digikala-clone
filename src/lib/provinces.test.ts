import { describe, it, expect } from "vitest";
import { PROVINCES, getProvinceNames, getCities } from "./provinces";

describe("provinces", () => {
  it("exposes all 31 provinces", () => {
    expect(PROVINCES.length).toBe(31);
    expect(getProvinceNames().length).toBe(31);
    expect(getProvinceNames()).toContain("تهران");
    expect(getProvinceNames()).toContain("خراسان رضوی");
  });

  it("sorts province names in Persian alphabetical order", () => {
    const names = getProvinceNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "fa"));
    expect(names).toEqual(sorted);
    expect(names[0]).toBe("آذربایجان شرقی");
  });

  it("sorts cities within each province alphabetically", () => {
    // چک می‌کنیم دو شهر از استان تهران به ترتیب الفبایی در همان آرایه آمده‌اند
    const tehran = getCities("تهران");
    expect(tehran.indexOf("پردیس")).toBeGreaterThan(tehran.indexOf("پاکدشت"));
    expect(tehran.indexOf("شمیرانات")).toBeGreaterThan(tehran.indexOf("ری"));

    // تمام استان‌ها حداقل یک شهر دارند
    for (const p of PROVINCES) {
      expect(p.cities.length).toBeGreaterThan(0);
    }
  });

  it("tehran includes its cities and defaults to empty for unknown province", () => {
    expect(getCities("تهران")).toContain("پردیس");
    expect(getCities("نامعتبر")).toEqual([]);
  });
});
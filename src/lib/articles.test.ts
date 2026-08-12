import { describe, it, expect } from "vitest";
import { ARTICLES } from "./articles";

describe("articles", () => {
  it("contains at least one article with required fields", () => {
    expect(ARTICLES.length).toBeGreaterThan(0);
    for (const a of ARTICLES) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.excerpt).toBeTruthy();
      expect(a.category).toBeTruthy();
      expect(a.date).toMatch(/^[۰-۹]{4}\/[۰-۹]{2}\/[۰-۹]{2}$/);
    }
  });

  it("has unique ids", () => {
    const ids = ARTICLES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
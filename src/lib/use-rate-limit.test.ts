import { describe, it, expect } from "vitest";
import { formatCooldown, getRetryAfterSeconds } from "./use-rate-limit";

describe("formatCooldown", () => {
  it("seconds only", () => {
    expect(formatCooldown(45)).toBe("۰۰:۴۵");
  });
  it("minutes and seconds", () => {
    expect(formatCooldown(65)).toBe("۰۱:۰۵");
  });
  it("long cooldown", () => {
    expect(formatCooldown(3595)).toBe("۵۹:۵۵");
  });
  it("zero", () => {
    expect(formatCooldown(0)).toBe("۰۰:۰۰");
  });
});

describe("getRetryAfterSeconds", () => {
  it("parses Retry-After header", () => {
    const res = new Response(null, { headers: { "Retry-After": "120" } });
    expect(getRetryAfterSeconds(res)).toBe(120);
  });
  it("returns 0 when header missing", () => {
    expect(getRetryAfterSeconds(new Response(null))).toBe(0);
  });
  it("returns 0 for invalid value", () => {
    const res = new Response(null, { headers: { "Retry-After": "abc" } });
    expect(getRetryAfterSeconds(res)).toBe(0);
  });
});

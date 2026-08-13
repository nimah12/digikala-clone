import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { optimizeImage, percentSaved } from "./media-optimizer";

describe("media-optimizer", () => {
  it("optimizes a JPEG and reduces its byte size", async () => {
    // یک تصویر ۲۰۰۰×۲۰۰۰ نویزی بساز (کاندید خوب فشرده‌سازی)
    const input = await sharp({
      create: {
        width: 2000,
        height: 2000,
        channels: 3,
        background: { r: 120, g: 90, b: 60 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const { data, format } = await optimizeImage(input, { maxDimension: 1600, quality: 82 });

    expect(format).toBe("webp");
    expect(data.length).toBeLessThan(input.length);
    expect(percentSaved(input.length, data.length)).toBeGreaterThan(0);
  });

  it("resizes images larger than max dimension", async () => {
    const input = await sharp({
      create: {
        width: 3000,
        height: 1500,
        channels: 3,
        background: { r: 10, g: 200, b: 120 },
      },
    })
      .jpeg()
      .toBuffer();

    const { data } = await optimizeImage(input, { maxDimension: 1200 });
    const meta = await sharp(data).metadata();
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(1200);
    expect(meta.width).toBe(1200);
  });
});

import { describe, it, expect } from "vitest";
import {
  formatDuration,
  getTimelineStatus,
  getElapsedMinutes,
} from "./OrderTimeline";

describe("formatDuration", () => {
  it("formats minutes only in Persian", () => {
    expect(formatDuration(45)).toBe("۴۵ دقیقه");
  });

  it("formats hours and minutes in Persian", () => {
    expect(formatDuration(95)).toBe("۱ ساعت و ۳۵ دقیقه");
  });

  it("clamps negative and rounds", () => {
    expect(formatDuration(-10)).toBe("۰ دقیقه");
    expect(formatDuration(60.4)).toBe("۱ ساعت و ۰ دقیقه");
  });
});

describe("getTimelineStatus", () => {
  it("returns the correct stage across boundaries", () => {
    expect(getTimelineStatus(0).label).toBe("ثبت شده");
    expect(getTimelineStatus(14).label).toBe("ثبت شده");
    expect(getTimelineStatus(15).label).toBe("تأیید پرداخت");
    expect(getTimelineStatus(60).label).toBe("در حال آماده‌سازی");
    expect(getTimelineStatus(120).label).toBe("در مسیر تحویل");
    expect(getTimelineStatus(180).label).toBe("تحویل شده");
    expect(getTimelineStatus(240).label).toBe("تحویل شده");
  });
});

describe("getElapsedMinutes", () => {
  it("applies the demo speed multiplier", () => {
    const createdAt = new Date(Date.now() - 60 * 1000).toISOString();
    expect(getElapsedMinutes(createdAt, Date.now(), 1)).toBeCloseTo(1, 0);
    expect(getElapsedMinutes(createdAt, Date.now(), 60)).toBeCloseTo(60, 0);
  });

  it("returns 0 for missing date or now=0", () => {
    expect(getElapsedMinutes("", Date.now(), 60)).toBe(0);
    expect(getElapsedMinutes(new Date().toISOString(), 0, 60)).toBe(0);
  });
});
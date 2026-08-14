import { describe, expect, it } from "vitest";
import {
  formatIranDate,
  getIranHour,
  getIranParts,
  getPersianMonthGrid,
  getWeekdayIndex,
} from "./iran-time";

describe("iran-time (Asia/Tehran, UTC+3:30)", () => {
  it("hour را به وقت ایران محاسبه می‌کند نه UTC", () => {
    // 20:00 UTC = 23:30 تهران → ساعت ۲۳
    expect(getIranHour(new Date("2026-08-14T20:00:00Z"))).toBe(23);
    // 00:30 UTC = 04:00 تهران → ساعت ۴ (نزدیک صبح)
    expect(getIranHour(new Date("2026-08-14T00:30:00Z"))).toBe(4);
    // 09:00 UTC = 12:30 تهران → ساعت ۱۲ (ظهر)
    expect(getIranHour(new Date("2026-08-14T09:00:00Z"))).toBe(12);
  });

  it("ساعت لایو را با ارقام فارسی برمی‌گرداند", () => {
    const parts = getIranParts(new Date("2026-08-14T20:00:00Z"));
    // 23:30 به وقت ایران
    expect(parts.faTime.startsWith("۲۳:")).toBe(true);
    expect(parts.minute).toBe(30);
    expect(parts.hour).toBe(23);
  });

  it("تاریخ شمسی را درست قالب‌بندی می‌کند (نوروز ۱۴۰۵)", () => {
    // ۲۰:۳۰ UTC در ۲۰ مارس ۲۰۲۶ = نیمه‌شب ۱ فروردین ۱۴۰۵ در تهران
    const date = formatIranDate(new Date("2026-03-20T20:30:00Z"));
    expect(date).toContain("۱۴۰۵");
    expect(date).toContain("فروردین");
  });

  it("تاریخ میلادی را هم با روز و ماه کامل برمی‌گرداند", () => {
    const parts = getIranParts(new Date("2026-08-14T20:00:00Z"));
    expect(parts.enDate).toContain("2026");
  });
});

describe("تقویم شمسی ماهانه", () => {
  it("۱ فروردین ۱۴۰۵ = شنبه ۲۱ مارس ۲۰۲۶ (شروع هفته: شنبه)", () => {
    // ۲۱ مارس ۲۰۲۶، ظهر تهران — روز اول فروردین ۱۴۰۵
    const d = new Date("2026-03-21T12:00:00+03:30");
    expect(getWeekdayIndex(d)).toBe(0); // شنبه
  });

  it("شبکه‌ی فروردین ۱۴۰۵ از شنبه شروع و ۳۱ روز کامل دارد", () => {
    const grid = getPersianMonthGrid(1405, 1);
    expect(grid.year).toBe(1405);
    expect(grid.month).toBe(1);
    expect(grid.monthName).toBe("فروردین");
    // سلول‌های ماه جاری (inMonth=true) = ۳۱ روز
    expect(grid.cells.filter((c) => c.inMonth)).toHaveLength(31);
    // روز اول شبکه از شنبه شروع می‌شود (هیچ سلول خاکستری قبل از روز ۱ نیست)
    const first = grid.cells.find((c) => c.inMonth);
    expect(first).toBeDefined();
    expect(first!.day).toBe(1);
    // شبکه کاملِ هفته‌ها: تعداد کل سلول‌ها مضرب ۷
    expect(grid.cells.length % 7).toBe(0);
    // کل سلول‌ها: ۴ هفته‌ی کامل + ۳ روز اول = ۳۱ → ۳۵ سلول
    expect(grid.cells).toHaveLength(35);
  });

  it("تعداد روز ماه‌های مختلف را درست می‌شمارد (اسفند ۱۴۰۴ = ۲۹ روز)", () => {
    const grid = getPersianMonthGrid(1404, 12);
    expect(grid.monthName).toBe("اسفند");
    expect(grid.cells.filter((c) => c.inMonth)).toHaveLength(29);
  });

  it("جمعه‌ها علامت‌گذاری می‌شوند", () => {
    const grid = getPersianMonthGrid(1405, 1);
    const fridays = grid.cells.filter((c) => c.isFriday);
    expect(fridays.length).toBeGreaterThanOrEqual(4);
  });
});

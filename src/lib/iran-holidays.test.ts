import { describe, expect, it } from "vitest";
import { getIranHoliday } from "./iran-holidays";
import { getPersianMonthGrid } from "./iran-time";

describe("تعطیلات ثابت شمسی", () => {
  it("۱ فروردین = عید نوروز", () => {
    // ۱ فروردین ۱۴۰۵ = ۲۱ مارس ۲۰۲۶ (ظهر تهران)
    const h = getIranHoliday(new Date("2026-03-21T12:00:00+03:30"));
    expect(h?.name).toContain("نوروز");
  });

  it("۱۳ فروردین = روز طبیعت (سیزده‌به‌در)", () => {
    const h = getIranHoliday(new Date("2026-04-02T12:00:00+03:30"));
    expect(h?.name).toContain("طبیعت");
  });

  it("۲۲ بهمن = پیروزی انقلاب اسلامی", () => {
    // ۲۲ بهمن ۱۴۰۴ = ۱۱ فوریه ۲۰۲۶
    const h = getIranHoliday(new Date("2026-02-11T12:00:00+03:30"));
    expect(h?.name).toContain("انقلاب");
  });

  it("۱۴ خرداد = رحلت امام خمینی", () => {
    // ۱۴ خرداد ۱۴۰۵ = ۴ ژوئن ۲۰۲۶
    const h = getIranHoliday(new Date("2026-06-04T12:00:00+03:30"));
    expect(h?.name).toContain("رحلت");
  });
});

describe("تعطیلات متغیر قمری (islamic-umalqura)", () => {
  it("عید فطر در ۱ شوال تشخیص داده می‌شود", () => {
    // ۱ شوال ۱۴۴۸ = ۹ مارس ۲۰۲۷ (بر اساس ام‌القری)
    const h = getIranHoliday(new Date("2027-03-09T12:00:00+03:30"));
    expect(h?.name).toContain("فطر");
  });

  it("عاشورا در ۱۰ محرم تشخیص داده می‌شود", () => {
    // ۱۰ محرم ۱۴۴۸ = ۲۵ ژوئن ۲۰۲۶
    const h = getIranHoliday(new Date("2026-06-25T12:00:00+03:30"));
    expect(h?.name).toContain("عاشورا");
  });

  it("تداخل تعطیل: ۲۰ مارس ۲۰۲۶ هم ۲۹ اسفند است هم عید فطر — شمسی اول می‌شود", () => {
    const h = getIranHoliday(new Date("2026-03-20T12:00:00+03:30"));
    // چون شمسی قبل از قمری چک می‌شود، «ملی شدن صنعت نفت» برمی‌گردد
    expect(h?.name).toContain("نفت");
  });

  it("ماه جاری (مرداد ۱۴۰۵) تعطیلاتش داخل grid علامت‌گذاری شده", () => {
    const grid = getPersianMonthGrid(1405, 5); // مرداد ۱۴۰۵
    const holidays = grid.cells.filter((c) => c.inMonth && c.holiday);
    // مرداد معمولاً تعطیل ثابت ندارد ولی ممکن است تعطیل قمری (مثل تاسوعا/عاشورا) بیفتد
    // فقط مطمئن می‌شویم ساختار سالم است
    expect(grid.cells.length % 7).toBe(0);
    // هر سلول تعطیل، نام دارد
    for (const c of holidays) {
      expect(c.holiday!.length).toBeGreaterThan(0);
    }
  });

  it("فروردین ۱۴۰۵ حداقل ۶ روز تعطیل دارد (۱ تا ۴ نوروز + ۱۲ و ۱۳ فروردین)", () => {
    const grid = getPersianMonthGrid(1405, 1);
    const holidays = grid.cells.filter((c) => c.inMonth && c.holiday);
    expect(holidays.length).toBeGreaterThanOrEqual(6);
  });
});

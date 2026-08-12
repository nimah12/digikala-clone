import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("loads and shows core sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /دیجی\u200cکلون/ }).first()).toBeVisible();

    // بخش‌های کلیدی فروشگاه روی صفحه اصلی
    await expect(page.getByText("شگفت\u200cانگیزها", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("پرفروش\u200cترین\u200cها", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("مقالات و اخبار دنیای تکنولوژی").first()).toBeVisible();

    // دسته‌بندی‌های هدر
    await expect(page.getByText("موبایل", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("لپ\u200cتاپ", { exact: true }).first()).toBeVisible();
  });

  test("has a working search box", async ({ page }) => {
    await page.goto("/");
    const search = page.getByLabel("جستجو در دیجی‌کلون").first();
    await expect(search).toBeVisible();
  });

  test("navigation to cart page works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /سبد خرید/ }).first().click();
    await expect(page).toHaveURL(/\/cart/);
  });
});

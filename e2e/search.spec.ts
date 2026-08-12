import { test, expect } from "@playwright/test";

test.describe("search flow", () => {
  test("typing in search box and submitting shows results", async ({ page }) => {
    await page.goto("/");

    const search = page.getByLabel("جستجو در دیجی‌کلون").first();
    await search.fill("آیفون");
    await search.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(page.getByText(/نتایج جستجو برای «آیفون»/)).toBeVisible();
  });

  test("searching with no results shows empty state", async ({ page }) => {
    await page.goto("/search?q=zzzqwertyzzz");
    await expect(page.getByText(/کالایی با نام «zzzqwertyzzz» پیدا نشد/)).toBeVisible();
  });

  test("empty query shows prompt", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("عبارت مورد نظر خود را در جستجو وارد کنید.")).toBeVisible();
  });
});

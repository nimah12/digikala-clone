import { test, expect } from "@playwright/test";

test.describe("category pages", () => {
  test("mobile category lists products", async ({ page }) => {
    await page.goto("/category/mobile");
    await expect(page).toHaveURL(/\/category\/mobile/);
    await expect(page.getByRole("heading", { name: /موبایل/ })).toBeVisible();
    // تعداد کالا نشان داده شده است
    await expect(page.getByText(/کالا/).first()).toBeVisible();
  });

  test("unknown category shows not found", async ({ page }) => {
    await page.goto("/category/not-a-real-category");
    await expect(page.getByText("صفحه مورد نظر پیدا نشد")).toBeVisible();
  });
});

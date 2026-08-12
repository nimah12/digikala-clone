import { test, expect } from "@playwright/test";

test.describe("product detail", () => {
  test("loads a product page and adds it to cart", async ({ page }) => {
    await page.goto("/product/airpods-pro-2");
    await expect(page).toHaveURL(/\/product\/airpods-pro-2/);

    // صفحه محصول لود شده و دکمه افزودن به سبد پیداست
    const addButton = page.getByRole("button", { name: /افزودن به سبد خرید/ });
    await expect(addButton).toBeVisible();

    // اضافه کردن به سبد
    await addButton.click();
    await expect(page.getByText("به سبد اضافه شد ✓")).toBeVisible({ timeout: 5000 });

    // رفتن به سبد
    await page.getByRole("link", { name: /سبد خرید/ }).first().click();
    await expect(page).toHaveURL(/\/cart/);
  });
});
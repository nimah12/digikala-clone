import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "fa-IR" });
const page = await context.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
const res = await page.evaluate(async () => (await fetch("/api/demo-login", { method: "POST" })).json());
await page.evaluate(({ token, user }) => { localStorage.setItem("dk-token", token); localStorage.setItem("dk-user", JSON.stringify(user)); window.dispatchEvent(new Event("dk-user-changed")); }, { token: res.token, user: res.user });
await page.goto("http://localhost:3000/admin/products", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);

async function sw(label) {
  return await page.evaluate((lbl) => {
    return { label: lbl, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth };
  }, label);
}

console.log("baseline:", JSON.stringify(await sw("base")));
// hide the whole product grid (the minmax grid)
await page.evaluate(() => {
  document.querySelectorAll('div[style*="minmax(0, 1fr)"]').forEach(d => d.style.display = "none");
});
console.log("after hiding product grid:", JSON.stringify(await sw("grid-hidden")));
await page.evaluate(() => { document.querySelectorAll('div[style*="minmax(0, 1fr)"]').forEach(d => d.style.display = ""); });

// hide all file inputs
await page.evaluate(() => { document.querySelectorAll('input[type="file"]').forEach(d => d.style.display = "none"); });
console.log("after hiding file inputs:", JSON.stringify(await sw("file-hidden")));

// hide the SupportChat FAB
await page.evaluate(() => { const b = document.querySelector('button[aria-label*="پشتیبانی"]'); if (b) b.style.display = "none"; });
console.log("after hiding FAB:", JSON.stringify(await sw("fab-hidden")));

// hide Toast
await page.evaluate(() => { document.querySelectorAll("[id*='toast'], [class*='toast']").forEach(d => { if (getComputedStyle(d).position === "fixed") d.style.display = "none"; }); });
console.log("after hiding toasts:", JSON.stringify(await sw("toast-hidden")));
await browser.close();

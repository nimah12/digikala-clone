import { chromium } from "playwright";

const OUT = "C:\\Users\\ROSEPC~1\\AppData\\Local\\Temp\\kilo\\admin-products-mobile.png";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "fa-IR",
});
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERR: " + e.message));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

// demo login
const res = await page.evaluate(async () => {
  const r = await fetch("/api/demo-login", { method: "POST" });
  const data = await r.json();
  return data;
});
if (!res || !res.token) {
  console.log("DEMO LOGIN FAILED:", JSON.stringify(res));
  process.exit(1);
}
await page.evaluate(({ token, user }) => {
  localStorage.setItem("dk-token", token);
  localStorage.setItem("dk-user", JSON.stringify(user));
  window.dispatchEvent(new Event("dk-user-changed"));
}, { token: res.token, user: res.user });

await page.goto("http://localhost:3000/admin/products", { waitUntil: "networkidle" });
// wait for products to load (denied/loading -> list)
await page.waitForTimeout(2500);

// scroll a bit to ensure list rendered
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

await page.screenshot({ path: OUT, fullPage: true });
console.log("SCREENSHOT:", OUT);
console.log("CONSOLE ERRORS:", errors.length ? JSON.stringify(errors.slice(0, 10)) : "none");

// also report the document width vs viewport to detect horizontal overflow
const metrics = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  bodyScrollW: document.body.scrollWidth,
}));
console.log("METRICS:", JSON.stringify(metrics));

await browser.close();

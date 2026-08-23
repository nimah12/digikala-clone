const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.screenshot({ path: "C:\\Users\\ROSE PC\\AppData\\Local\\Temp\\login_before.png" });
  const btn = page.getByText("ورود سریع دمو");
  await btn.click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "C:\\Users\\ROSE PC\\AppData\\Local\\Temp\\after_top.png" });
  const headerText = await page.locator("header").innerText().catch(() => "NO HEADER");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "C:\\Users\\ROSE PC\\AppData\\Local\\Temp\\after_bottom.png" });
  console.log("URL:", page.url());
  console.log("HEADER:", headerText);
  console.log("ERRORS:", JSON.stringify(errors.slice(0, 6)));
  await browser.close();
})();

import { chromium } from "@playwright/test";

async function verifyBrowser() {
  console.log("Launching Chromium via Playwright...");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  console.log("Navigating to http://localhost:5173/ ...");
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: "shots/m04-browser-verify.png" });
  console.log("Screenshot saved to shots/m04-browser-verify.png");

  // Verify elements
  const title = await page.title();
  console.log("Page title:", title);

  const recVisible = await page.isVisible("text=● REC");
  console.log("REC indicator visible:", recVisible);

  const cam1Visible = await page.isVisible("text=CAM 01");
  console.log("CAM 01 button visible:", cam1Visible);

  // Test interactive buttons
  await page.click("text=CAM 02");
  await page.waitForTimeout(300);
  const activeFeedText = await page.textContent("main");
  console.log("Clicked CAM 02. Content contains CAM 02:", activeFeedText?.includes("CAM 02"));

  await page.click("text=TRIGGER GLITCH");
  await page.waitForTimeout(300);
  console.log("Triggered glitch successfully.");

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error("Console errors encountered:", consoleErrors);
    process.exit(1);
  } else {
    console.log("Browser verification PASSED with 0 console errors.");
  }
}

verifyBrowser().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

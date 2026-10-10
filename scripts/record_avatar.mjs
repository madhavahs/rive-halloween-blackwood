import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

async function recordAvatar() {
  const outputDir = path.resolve("recordings/raw_avatar");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--window-size=270,200", "--hide-scrollbars"],
  });

  const context = await browser.newContext({
    viewport: { width: 270, height: 200 },
    recordVideo: {
      dir: outputDir,
      size: { width: 270, height: 200 },
    },
  });

  const page = await context.newPage();
  const fileUrl = "file://" + path.resolve("recordings/avatar.html").replace(/\\/g, "/");
  console.log("Navigating to avatar page:", fileUrl);
  await page.goto(fileUrl);

  // Record for 60 seconds
  console.log("Recording avatar for 60 seconds...");
  await page.waitForTimeout(60000);

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawPath = await video.path();
    const destPath = path.resolve("recordings/avatar.webm");
    fs.copyFileSync(rawPath, destPath);
    console.log("Avatar video saved to:", destPath);
  }
}

recordAvatar().catch((err) => {
  console.error("Avatar recording failed:", err);
  process.exit(1);
});

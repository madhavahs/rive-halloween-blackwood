import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

async function captureHighResBanners() {
  console.log("Launching Chromium for 1600x1200 (4:3) Submission Imagery...");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-gl=angle",
      "--use-angle=default",
      "--enable-webgl",
      "--enable-webgl2",
      "--hide-scrollbars",
      "--window-size=1600,1200",
    ],
  });

  const page = await browser.newPage({
    viewport: { width: 1600, height: 1200 },
  });

  const targetUrl = process.env.TARGET_URL || "http://localhost:4173/";
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Capture 1600x1200 Hero Surveillance Terminal (CAM 01 with Scarecrow)
  await page.mouse.move(800, 600);
  await page.waitForTimeout(500);
  const heroPath = path.resolve("shots/blackwood-hero-1600x1200.png");
  await page.screenshot({ path: heroPath });
  console.log("Saved 1600x1200 Hero Image:", heroPath);

  // 2. Capture 1600x1200 Monster Bestiary Dossier
  await page.click("button:has-text('MONSTER DOSSIER')");
  await page.waitForTimeout(600);
  const dossierPath = path.resolve("shots/blackwood-dossier-1600x1200.png");
  await page.screenshot({ path: dossierPath });
  console.log("Saved 1600x1200 Dossier Image:", dossierPath);

  // Close dossier
  await page.click("button:has-text('CLOSE DOSSIER')");
  await page.waitForTimeout(400);

  // 3. Capture 1600x1200 3D The Further
  await page.click("button:has-text('THE FURTHER')");
  await page.waitForTimeout(1200);
  await page.mouse.move(800, 550);
  await page.waitForTimeout(600);
  const furtherPath = path.resolve("shots/blackwood-3d-1600x1200.png");
  await page.screenshot({ path: furtherPath });
  console.log("Saved 1600x1200 3D Mode Image:", furtherPath);

  await browser.close();

  // Copy images to Desktop for easy drag-and-drop
  const desktop = "C:/Users/Madhav/OneDrive/Desktop";
  fs.copyFileSync(heroPath, path.join(desktop, "blackwood-hero-1600x1200.png"));
  fs.copyFileSync(furtherPath, path.join(desktop, "blackwood-3d-1600x1200.png"));
  fs.copyFileSync(dossierPath, path.join(desktop, "blackwood-dossier-1600x1200.png"));
  console.log("Copied 1600x1200 images directly to Desktop!");
}

captureHighResBanners().catch((err) => {
  console.error("Banner capture failed:", err);
  process.exit(1);
});

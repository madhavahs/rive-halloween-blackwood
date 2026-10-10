import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function recordWalkthrough() {
  const outputDir = path.resolve("recordings/raw");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Chromium for 60-Second Walkthrough Recording...");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-gl=angle",
      "--use-angle=default",
      "--enable-webgl",
      "--enable-webgl2",
      "--hide-scrollbars",
      "--disable-notifications",
      "--window-size=1280,720",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  async function smoothMouseMove(startX, startY, endX, endY, steps = 20, delayMs = 25) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const x = startX + (endX - startX) * ease;
      const y = startY + (endY - startY) * ease;
      await page.mouse.move(x, y);
      await page.waitForTimeout(delayMs);
    }
  }

  const targetUrl = process.env.TARGET_URL || "http://localhost:4173/";
  console.log(`Navigating to ${targetUrl} ...`);
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // SECTION 1 (0:00 - 0:10): SURVEILLANCE BOOT & FLASHLIGHT SCANNING
  console.log("Recording Section 1: 2D Surveillance Feeds & Flashlight Scanning...");
  // Sweep flashlight across CAM 01 (Foyer)
  await smoothMouseMove(640, 360, 400, 280, 20, 25);
  await smoothMouseMove(400, 280, 780, 420, 25, 25);
  await smoothMouseMove(780, 420, 520, 480, 20, 25);
  await page.waitForTimeout(600);

  // Switch to CAM 02 (West Hall)
  await page.click("button:has-text('CAM 02')");
  await page.waitForTimeout(500);
  await smoothMouseMove(520, 480, 640, 320, 20, 25);
  await smoothMouseMove(640, 320, 750, 360, 15, 25);
  await page.waitForTimeout(800);

  // SECTION 2 (0:10 - 0:22): MONSTER DOSSIER & SECTOR INVESTIGATION
  console.log("Recording Section 2: Classified Monster Dossier...");
  await page.click("button:has-text('MONSTER DOSSIER')");
  await page.waitForTimeout(1200);

  // Scroll dossier smoothly to showcase monsters
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(800);

  // Close Dossier and inspect CAM 03 (Archivum)
  await page.click("button:has-text('CLOSE DOSSIER')");
  await page.waitForTimeout(500);
  await page.click("button:has-text('CAM 03')");
  await page.waitForTimeout(500);
  await smoothMouseMove(640, 360, 680, 440, 20, 25);
  await page.waitForTimeout(800);

  // Switch to CAM 04 (Crimson Void Demon)
  await page.click("button:has-text('CAM 04')");
  await page.waitForTimeout(500);
  await smoothMouseMove(680, 440, 560, 320, 20, 25);
  await page.waitForTimeout(800);

  // SECTION 3 (0:22 - 0:42): 3D THE FURTHER // SPECTRAL INVESTIGATION
  console.log("Recording Section 3: 3D The Further & EMF Ghost Detection...");
  await page.click("button:has-text('THE FURTHER')");
  await page.waitForTimeout(1800);

  // Aim flashlight along 3D corridor
  await smoothMouseMove(640, 360, 380, 260, 25, 25);
  await smoothMouseMove(380, 260, 860, 380, 30, 25);
  await smoothMouseMove(860, 380, 640, 360, 25, 25);
  await page.waitForTimeout(1000);

  // Trigger Ghost Whisper
  await page.click("button:has-text('GHOST WHISPER')");
  await page.waitForTimeout(2000);

  // Trigger Music Box
  await page.click("button:has-text('MUSIC BOX')");
  await page.waitForTimeout(2000);

  // Toggle Flashlight off for blackout suspense using key F
  await page.keyboard.press("KeyF");
  await page.waitForTimeout(1500);
  // Toggle Flashlight back on
  await page.keyboard.press("KeyF");
  await page.waitForTimeout(1500);

  // Return to surveillance terminal using Escape key
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);

  // SECTION 4 (0:42 - 0:54): STORY ESCALATION & CLIMAX JUMPSCARE
  console.log("Recording Section 4: Narrative Escalation & Climax Jumpscare...");
  // Advance through beats to systemFailure and finalReveal
  while (await page.isEnabled("button:has-text('ADVANCE BEAT')")) {
    await page.click("button:has-text('ADVANCE BEAT')");
    await page.waitForTimeout(1400);
  }

  // Hold on Final Reveal climax
  console.log("Holding on Final Reveal Climax...");
  await page.waitForTimeout(2500);

  // Execute Reboot Terminal
  console.log("Executing Emergency Terminal Reboot...");
  await page.click("button:has-text('REBOOT TERMINAL')");
  await page.waitForTimeout(2000);

  // Final smooth pan over clean terminal
  await smoothMouseMove(640, 360, 700, 300, 20, 25);
  await page.waitForTimeout(1000);

  // Close context to flush video
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawPath = await video.path();
    console.log("Raw video successfully recorded to:", rawPath);
    // Copy/rename to a predictable file name
    const destPath = path.resolve("recordings/blackwood-raw.webm");
    fs.copyFileSync(rawPath, destPath);
    console.log("Copied raw recording to:", destPath);
  }
}

recordWalkthrough().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});

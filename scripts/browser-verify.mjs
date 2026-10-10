import { chromium } from "@playwright/test";

async function verifyBrowser() {
  console.log("Launching Chromium via Playwright...");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, hasTouch: true });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("ScriptAsset doesn't have a generator function")) {
        consoleErrors.push(text);
      }
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  const targetUrl = process.env.TARGET_URL || "http://localhost:4173/";
  console.log(`Navigating to ${targetUrl} ...`);
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Capture CAM 01 // The Burlap Scarecrow with flashlight
  await page.mouse.move(640, 420);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/halloween-character-cam01.png" });
  console.log("Captured CAM 01 Burlap Scarecrow -> shots/halloween-character-cam01.png");

  // 2. Capture CAM 02 // The Spectral Bride
  await page.click("button:has-text('CAM 02')");
  await page.mouse.move(640, 380);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/halloween-character-cam02.png" });
  console.log("Captured CAM 02 Spectral Bride -> shots/halloween-character-cam02.png");

  // 3. Capture CAM 03 // The Pumpkin Stalker
  await page.click("button:has-text('CAM 03')");
  await page.mouse.move(640, 450);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/halloween-character-cam03.png" });
  console.log("Captured CAM 03 Pumpkin Stalker -> shots/halloween-character-cam03.png");

  // 4. Capture CAM 04 // The Crimson Void Demon
  await page.click("button:has-text('CAM 04')");
  await page.mouse.move(640, 400);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/halloween-character-cam04.png" });
  console.log("Captured CAM 04 Crimson Void Demon -> shots/halloween-character-cam04.png");

  // 5. Open and capture Classified Monster Bestiary Dossier
  await page.click("button:has-text('MONSTER DOSSIER')");
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shots/halloween-dossier.png" });
  console.log("Captured Classified Monster Bestiary Dossier -> shots/halloween-dossier.png");

  // Return to surveillance
  await page.click("button:has-text('CLOSE DOSSIER')");
  await page.waitForTimeout(400);

  // 5.5 Enter 3D Mode // The Further Spectral Investigation
  await page.click("button:has-text('THE FURTHER')");
  await page.waitForTimeout(1000);
  await page.mouse.move(640, 360);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shots/halloween-3d-spectral.png" });
  console.log("Captured 3D Mode Spectral Investigation -> shots/halloween-3d-spectral.png");

  // Test Ghost Whisper trigger in 3D
  await page.click("button:has-text('GHOST WHISPER')");
  await page.waitForTimeout(400);

  // Return to surveillance from 3D mode
  await page.click("button:has-text('RETURN TO SURVEILLANCE')");
  await page.waitForTimeout(400);

  // 6. Advance to FINAL REVEAL to test climax jumpscare
  while (await page.isEnabled("button:has-text('ADVANCE BEAT')")) {
    await page.click("button:has-text('ADVANCE BEAT')");
    await page.waitForTimeout(250);
  }

  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/halloween-climax.png" });
  console.log("Captured Climax State -> shots/halloween-climax.png");

  // 7. Reboot Terminal
  await page.click("button:has-text('REBOOT TERMINAL')");
  await page.waitForTimeout(400);

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error("Console errors encountered:", consoleErrors);
    process.exit(1);
  } else {
    console.log("Halloween Browser Verification PASSED with 0 console errors!");
  }
}

verifyBrowser().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

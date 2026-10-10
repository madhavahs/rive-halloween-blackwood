import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function recordWalkthrough() {
  const outputDir = path.resolve("recordings/raw");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Chromium for Precision-Timed Highlighted Walkthrough (60s)...");
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

  const targetUrl = process.env.TARGET_URL || "http://localhost:4173/";
  console.log(`Navigating to ${targetUrl} ...`);
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Inject sleek glowing cursor, click ripple, and command callout HUD styles
  await page.addStyleTag({
    content: `
      #virtual-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 24px;
        height: 24px;
        pointer-events: none;
        z-index: 9999999;
        transform: translate(-3px, -3px);
        transition: transform 0.03s ease;
      }
      .click-ripple {
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999998;
        border: 2px solid #33ff77;
        box-shadow: 0 0 16px #33ff77, inset 0 0 10px #33ff77;
        animation: ripple-anim 0.6s ease-out forwards;
      }
      @keyframes ripple-anim {
        0% { width: 10px; height: 10px; opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { width: 85px; height: 85px; opacity: 0; transform: translate(-50%, -50%) scale(2.0); }
      }
      .command-hud-toast {
        position: fixed;
        bottom: 85px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(5, 12, 8, 0.94);
        border: 1px solid #33ff77;
        border-radius: 3px;
        box-shadow: 0 0 18px rgba(51, 255, 119, 0.5);
        color: #33ff77;
        padding: 6px 18px;
        font-family: Consolas, monospace;
        font-size: 13px;
        font-weight: bold;
        letter-spacing: 1.5px;
        z-index: 9999999;
        pointer-events: none;
        animation: toast-fade 2.0s forwards;
      }
      @keyframes toast-fade {
        0% { opacity: 0; transform: translate(-50%, 8px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -6px); }
      }
    `,
  });

  // Inject the virtual cursor element with a glowing tactical pointer SVG
  await page.evaluate(() => {
    const cur = document.createElement("div");
    cur.id = "virtual-cursor";
    cur.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 2L18 13L11 14L8 21L4 2Z" fill="#33ff77" stroke="#050308" stroke-width="1.8" filter="drop-shadow(0 0 5px #33ff77)"/>
      </svg>
    `;
    document.body.appendChild(cur);
  });

  let currentCursor = { x: 640, y: 360 };

  async function updateCursorPosition(x, y) {
    currentCursor = { x, y };
    await page.mouse.move(x, y);
    await page.evaluate(({ cx, cy }) => {
      const el = document.getElementById("virtual-cursor");
      if (el) {
        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;
      }
    }, { cx: x, cy: y });
  }

  async function smoothMouseMove(endX, endY, steps = 14, delayMs = 20) {
    const startX = currentCursor.x;
    const startY = currentCursor.y;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const x = Math.round(startX + (endX - startX) * ease);
      const y = Math.round(startY + (endY - startY) * ease);
      await updateCursorPosition(x, y);
      await page.waitForTimeout(delayMs);
    }
  }

  async function clickWithHighlight(selector, commandSubtitle = null) {
    const el = await page.$(selector);
    if (!el) {
      console.warn("Element not found for selector:", selector);
      return;
    }
    const isEnabled = await el.isEnabled().catch(() => false);
    if (!isEnabled) {
      console.warn("Element is disabled:", selector);
      return;
    }
    const box = await el.boundingBox();
    if (!box) return;
    const cx = Math.round(box.x + box.width / 2);
    const cy = Math.round(box.y + box.height / 2);

    // Smoothly pan cursor to target
    await smoothMouseMove(cx, cy, 14, 18);
    await page.waitForTimeout(60);

    // Trigger glowing click ripple and command subtitle toast
    await page.evaluate(({ x, y, sub }) => {
      // Expanding ripple
      const r = document.createElement("div");
      r.className = "click-ripple";
      r.style.left = `${x}px`;
      r.style.top = `${y}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);

      // Command subtitle callout
      if (sub) {
        const existing = document.querySelector(".command-hud-toast");
        if (existing) existing.remove();
        const toast = document.createElement("div");
        toast.className = "command-hud-toast";
        toast.textContent = sub;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    }, { x: cx, y: cy, sub: commandSubtitle });

    await el.click().catch(() => {});
  }

  // --- SCENARIO TIMED TO EXACT 60 SECONDS ---

  // SECTION 1 (0s - 11s): SURVEILLANCE BOOT & FLASHLIGHT SCANNING
  console.log("Section 1 (0s-11s): Flashlight sweeping and Cam switching...");
  await updateCursorPosition(640, 360);
  await smoothMouseMove(420, 280, 16, 25);
  await smoothMouseMove(760, 420, 18, 25);
  await smoothMouseMove(520, 470, 14, 25);
  await page.waitForTimeout(500);

  // Click CAM 02 with highlight and subtitle
  await clickWithHighlight("button:has-text('CAM 02')", "[COMMAND] SWITCH FEED -> CAM 02 // WEST HALL");
  await page.waitForTimeout(400);
  await smoothMouseMove(640, 320, 14, 25);
  await smoothMouseMove(750, 360, 12, 25);
  await page.waitForTimeout(600);

  // SECTION 2 (11s - 22s): MONSTER DOSSIER & CAM 03
  console.log("Section 2 (11s-22s): Monster Dossier & CAM 03...");
  await clickWithHighlight("button:has-text('MONSTER DOSSIER')", "[COMMAND] OPEN DOSSIER // OCCULT BESTIARY");
  await page.waitForTimeout(900);

  // Scroll through monsters
  await page.mouse.wheel(0, 260);
  await page.waitForTimeout(800);
  await page.mouse.wheel(0, -260);
  await page.waitForTimeout(500);

  // Close Dossier
  await clickWithHighlight("button:has-text('CLOSE DOSSIER')", "[COMMAND] CLOSE DOSSIER // RETURN TO FEEDS");
  await page.waitForTimeout(400);

  // Jump to CAM 03
  await clickWithHighlight("button:has-text('CAM 03')", "[COMMAND] SWITCH FEED -> CAM 03 // ARCHIVUM");
  await page.waitForTimeout(400);
  await smoothMouseMove(680, 430, 14, 25);
  await page.waitForTimeout(500);

  // SECTION 3 (22s - 38s): 3D THE FURTHER // SPECTRAL INVESTIGATION
  console.log("Section 3 (22s-38s): 3D The Further...");
  await clickWithHighlight("button:has-text('THE FURTHER')", "[COMMAND] ENTER 3D REALM // THE FURTHER");
  await page.waitForTimeout(1400);

  // Sweep 3D flashlight beam across the corridor
  await smoothMouseMove(380, 270, 16, 25);
  await smoothMouseMove(860, 380, 18, 25);
  await smoothMouseMove(640, 360, 14, 25);
  await page.waitForTimeout(600);

  // Trigger Ghost Whisper
  await clickWithHighlight("button:has-text('GHOST WHISPER')", "[COMMAND] AUDIO TRIGGER // GHOST WHISPER");
  await page.waitForTimeout(1500);

  // Trigger Music Box
  await clickWithHighlight("button:has-text('MUSIC BOX')", "[COMMAND] AUDIO TRIGGER // MUSIC BOX");
  await page.waitForTimeout(1500);

  // Return to surveillance
  await clickWithHighlight("button:has-text('RETURN TO SURVEILLANCE')", "[COMMAND] EXIT 3D REALM // SURVEILLANCE");
  await page.waitForTimeout(800);

  // SECTION 4 (38s - 49s): STORY ESCALATION & CLIMAX JUMPSCARE
  console.log("Section 4 (38s-49s): Story Escalation & Climax...");
  for (let b = 0; b < 3; b++) {
    const btn = await page.$("button:has-text('ADVANCE BEAT')");
    if (btn && (await btn.isEnabled().catch(() => false))) {
      await clickWithHighlight(
        "button:has-text('ADVANCE BEAT')",
        b === 0 ? "[COMMAND] PACING // ADVANCE BEAT" : "[COMMAND] PACING // SYSTEM FAILURE"
      );
      await page.waitForTimeout(800);
    }
  }

  // Hold on Final Reveal climax
  console.log("Holding on Final Reveal Climax...");
  await page.waitForTimeout(2500);

  // SECTION 5 (49s - 60s): EMERGENCY REBOOT & VICTORY OUTRO
  console.log("Section 5 (49s-60s): Emergency Reboot & Victory...");
  await clickWithHighlight("button:has-text('REBOOT TERMINAL')", "[COMMAND] EMERGENCY PURGE & REBOOT");
  await page.waitForTimeout(1400);

  // Final smooth pan over clean terminal
  await smoothMouseMove(700, 320, 14, 25);
  await page.waitForTimeout(1200);

  // Close context to finalize video
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawPath = await video.path();
    console.log("Raw highlighted cursor video recorded to:", rawPath);
    const destPath = path.resolve("recordings/blackwood-raw.webm");
    fs.copyFileSync(rawPath, destPath);
    console.log("Saved raw recording to:", destPath);
  }
}

recordWalkthrough().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});

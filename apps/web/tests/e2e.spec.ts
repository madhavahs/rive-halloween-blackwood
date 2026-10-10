import { test, expect } from "@playwright/test";

test.describe("BLACKWOOD Surveillance Terminal E2E", () => {
  test("should complete full user lifecycle from boot to final reveal and reboot", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
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

    // 1. Initial Page Load
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("role=region[name='Surveillance Terminal Interface']")).toBeVisible();

    // 2. Camera Switching Verification
    const cam2Btn = page.getByRole("button", { name: /Camera 02/i });
    await expect(cam2Btn).toBeVisible();
    await cam2Btn.click();
    await expect(page.getByRole("status")).toContainText("CAM 02 // WEST HALL");

    const cam3Btn = page.getByRole("button", { name: /Camera 03/i });
    await cam3Btn.click();
    await expect(page.getByRole("status")).toContainText("CAM 03 // ARCHIVUM");

    // 3. Flashlight Toggling (Button & Hotkey)
    const lightBtn = page.getByRole("button", { name: /Flashlight/i });
    await expect(lightBtn).toContainText("LIGHT: ON [F]");
    await lightBtn.click();
    await expect(lightBtn).toContainText("LIGHT: OFF [F]");
    await page.keyboard.press("f");
    await expect(lightBtn).toContainText("LIGHT: ON [F]");

    // 4. Audio Mute Toggling (Button & Hotkey)
    const audioBtn = page.getByRole("button", { name: /Audio effects/i });
    await expect(audioBtn).toContainText("AUDIO: ON [M]");
    await audioBtn.click();
    await expect(audioBtn).toContainText("AUDIO: MUTED [M]");
    await page.keyboard.press("m");
    await expect(audioBtn).toContainText("AUDIO: ON [M]");

    // 5. Interactive Flashlight Movement
    await page.mouse.move(300, 300);
    await page.waitForTimeout(200);
    await page.mouse.move(700, 450);
    await page.waitForTimeout(200);

    // 6. Advance Narrative Beats
    const advanceBtn = page.getByRole("button", { name: /Advance story beat/i });

    // Beat 1: normal -> motionDetected
    await advanceBtn.click();
    await expect(page.getByRole("status")).toContainText("STATE: MOTIONDETECTED");

    // Beat 2: motionDetected -> cameraGlitch
    await advanceBtn.click();
    await expect(page.getByRole("status")).toContainText("STATE: CAMERAGLITCH");

    // Advance through entityVisible, entityTracking, systemFailure to finalReveal
    while (await advanceBtn.isEnabled()) {
      await advanceBtn.click();
      await page.waitForTimeout(150);
    }

    // 7. Verify Climax State (finalReveal)
    await expect(page.getByRole("status")).toContainText("STATE: FINALREVEAL");
    await expect(page.getByRole("alert")).toContainText("CONNECTION SEVERED — ENTITY IN PROXIMITY");

    // Camera buttons should now be locked
    await expect(cam2Btn).toBeDisabled();

    // 8. Reboot Terminal
    const rebootBtn = page.getByRole("button", { name: /Reboot surveillance terminal/i });
    await expect(rebootBtn).toBeVisible();
    await rebootBtn.click();

    // Verify reset to NORMAL state
    await expect(page.getByRole("status")).toContainText("STATE: NORMAL");
    await expect(cam2Btn).toBeEnabled();

    // Zero uncaught console errors
    expect(consoleErrors).toEqual([]);
  });

  test("should handle touch interaction on mobile viewport", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Touch tests only run on mobile viewport");
    await page.goto("/", { waitUntil: "networkidle" });

    // Simulate mobile touch drag for flashlight
    await page.touchscreen.tap(200, 400);
    await page.waitForTimeout(200);

    // Camera buttons still responsive on touch
    const cam4Btn = page.getByRole("button", { name: /Camera 04/i });
    await cam4Btn.tap();
    await expect(page.getByRole("status")).toContainText("CAM 04");
  });
});

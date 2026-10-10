import { test, expect } from "@playwright/test";

test.describe("BLACKWOOD Accessibility Audit", () => {
  test("should provide accessible landmarks, live regions, and labels", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // 1. Region landmark
    const terminalRegion = page.getByRole("region", { name: "Surveillance Terminal Interface" });
    await expect(terminalRegion).toBeVisible();

    // 2. Status landmark
    const statusTelemetry = page.getByRole("status", { name: "Surveillance system telemetry" });
    await expect(statusTelemetry).toBeVisible();

    // 3. Live region for event logs
    const eventLog = page.getByRole("log", { name: "System event logs" });
    await expect(eventLog).toBeVisible();
    await expect(eventLog).toHaveAttribute("aria-live", "polite");

    // 4. Interactive buttons have accessible labels
    const camButtons = [1, 2, 3, 4];
    for (const cam of camButtons) {
      const btn = page.getByRole("button", { name: new RegExp(`Camera 0${cam}`, "i") });
      await expect(btn).toBeVisible();
    }

    const lightBtn = page.getByRole("button", { name: /Flashlight/i });
    await expect(lightBtn).toBeVisible();

    const audioBtn = page.getByRole("button", { name: /Audio effects/i });
    await expect(audioBtn).toBeVisible();

    const advanceBtn = page.getByRole("button", { name: /Advance story beat/i });
    await expect(advanceBtn).toBeVisible();
  });

  test("should support prefers-reduced-motion media query", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });

    // Verify terminal renders cleanly with reduced motion
    await expect(page.locator("main")).toBeVisible();

    // Advance to final reveal
    const advanceBtn = page.getByRole("button", { name: /Advance story beat/i });
    while (await advanceBtn.isEnabled()) {
      await advanceBtn.click();
      await page.waitForTimeout(100);
    }

    // Verify alert displays properly under reduced motion
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});

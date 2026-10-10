import { describe, it, expect } from "vitest";
import { calculateFlashlightFlicker, calculateBeamRadius } from "./FlashlightOverlay";

describe("FlashlightOverlay calculations & behavior", () => {
  it("should calculate beam radius proportional to screen width within bounded limits", () => {
    // Very small screen: clamped to min 140
    expect(calculateBeamRadius(500)).toBe(140);

    // Medium screen (1280px): 1280 * 0.18 = 230.4
    const r1280 = calculateBeamRadius(1280);
    expect(r1280).toBeCloseTo(230.4, 1);
    expect(r1280).toBeGreaterThanOrEqual(140);
    expect(r1280).toBeLessThanOrEqual(280);

    // Very large 4K screen (3840px): clamped to max 280
    expect(calculateBeamRadius(3840)).toBe(280);
  });

  it("should maintain steady 1.0 intensity when entity distance is >= 30", () => {
    expect(calculateFlashlightFlicker(1000, 100)).toBe(1.0);
    expect(calculateFlashlightFlicker(2500, 50)).toBe(1.0);
    expect(calculateFlashlightFlicker(5000, 30)).toBe(1.0);
  });

  it("should induce intensity variance and attenuation when entity distance < 30", () => {
    const flickerNear = calculateFlashlightFlicker(1000, 10);
    expect(flickerNear).toBeGreaterThanOrEqual(0.4);
    expect(flickerNear).toBeLessThanOrEqual(1.0);

    const flickerClimax = calculateFlashlightFlicker(2000, 0);
    expect(flickerClimax).toBeGreaterThanOrEqual(0.4);
    expect(flickerClimax).toBeLessThanOrEqual(1.0);
  });
});

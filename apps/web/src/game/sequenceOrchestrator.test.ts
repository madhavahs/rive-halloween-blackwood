import { describe, it, expect } from "vitest";
import {
  TIMELINE_SCHEDULE,
  evaluateNextTimelineState,
  isStatePreceding,
  calculatePacingMultiplier,
} from "./sequenceOrchestrator";
import { createInitialGameState } from "./gameState";

describe("SequenceOrchestrator progression logic", () => {
  it("should define a sequential timeline ending in finalReveal", () => {
    expect(TIMELINE_SCHEDULE.length).toBeGreaterThanOrEqual(6);
    expect(TIMELINE_SCHEDULE[TIMELINE_SCHEDULE.length - 1]!.targetState).toBe("finalReveal");
  });

  it("should correctly identify preceding states according to the narrative arc", () => {
    expect(isStatePreceding("normal", "motionDetected")).toBe(true);
    expect(isStatePreceding("motionDetected", "cameraGlitch")).toBe(true);
    expect(isStatePreceding("cameraGlitch", "finalReveal")).toBe(true);
    expect(isStatePreceding("finalReveal", "normal")).toBe(false);
  });

  it("should evaluate next timeline event when elapsed time passes threshold", () => {
    // Before threshold: null
    expect(evaluateNextTimelineState(5, "normal")).toBeNull();

    // At threshold for motionDetected (12s): returns event
    const event12 = evaluateNextTimelineState(12, "normal");
    expect(event12).not.toBeNull();
    expect(event12?.targetState).toBe("motionDetected");

    // Already in motionDetected at 12s: does not re-trigger
    expect(evaluateNextTimelineState(12, "motionDetected")).toBeNull();

    // At 85s: triggers finalReveal
    const event85 = evaluateNextTimelineState(85, "systemFailure");
    expect(event85?.targetState).toBe("finalReveal");
  });

  it("should calculate pacing multiplier acceleration when investigating anomaly", () => {
    const state = {
      ...createInitialGameState(),
      flashlightPosition: { x: 0.1, y: 0.1 },
    };
    // Default: 1.0 (on CAM 1, anomaly is on CAM 3, flashlight off-center)
    const baseMult = calculatePacingMultiplier(state);
    expect(baseMult).toBe(1.0);

    // Switch to anomaly camera (CAM 3): multiplier increases
    const anomalyCamState = { ...state, activeCamera: 3, entityCamera: 3 };
    const camMult = calculatePacingMultiplier(anomalyCamState);
    expect(camMult).toBeGreaterThan(baseMult);

    // Flashlight directly centered on anomaly: multiplier increases further
    const focusedState = {
      ...anomalyCamState,
      flashlightPosition: { x: 0.5, y: 0.5 },
      flashlightOn: true,
    };
    const focusedMult = calculatePacingMultiplier(focusedState);
    expect(focusedMult).toBeGreaterThan(camMult);
  });
});

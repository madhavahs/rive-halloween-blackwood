import { describe, it, expect } from "vitest";
import { SystemState, RiveController } from "../game/types";

describe("RiveController interface & state mapping", () => {
  const STATE_INDEX_MAP: Record<SystemState, number> = {
    boot: 0,
    normal: 1,
    motionDetected: 2,
    cameraGlitch: 3,
    entityVisible: 4,
    entityTracking: 5,
    systemFailure: 6,
    finalReveal: 7,
  };

  it("should map all SystemState values to sequential non-negative indices", () => {
    const states: SystemState[] = [
      "boot",
      "normal",
      "motionDetected",
      "cameraGlitch",
      "entityVisible",
      "entityTracking",
      "systemFailure",
      "finalReveal",
    ];

    states.forEach((state, expectedIndex) => {
      expect(STATE_INDEX_MAP[state]).toBe(expectedIndex);
    });
  });

  it("should implement RiveController interface without runtime failure", () => {
    let currentState: SystemState = "boot";
    let currentCam = 1;
    let glitchFired = false;
    let revealFired = false;

    const mockController: RiveController = {
      boot: () => {
        currentState = "boot";
      },
      setSystemState: (state) => {
        currentState = state;
      },
      setActiveCamera: (cam) => {
        currentCam = cam;
      },
      setSignalStrength: () => {},
      setEntityDistance: () => {},
      triggerGlitch: () => {
        glitchFired = true;
      },
      triggerFinalReveal: () => {
        revealFired = true;
      },
    };

    mockController.setSystemState("normal");
    expect(currentState).toBe("normal");

    mockController.setActiveCamera(3);
    expect(currentCam).toBe(3);

    mockController.triggerGlitch();
    expect(glitchFired).toBe(true);

    mockController.triggerFinalReveal();
    expect(revealFired).toBe(true);
  });
});

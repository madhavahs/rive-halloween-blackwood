import { describe, it, expect } from "vitest";
import {
  createInitialGameState,
  gameReducer,
  getNextSystemState,
  STATE_SEQUENCE,
  ExtendedGameState,
} from "./gameState";

describe("GameState reducer & progression engine", () => {
  it("should initialize with nominal normal state values", () => {
    const state = createInitialGameState();
    expect(state.systemState).toBe("normal");
    expect(state.activeCamera).toBe(1);
    expect(state.signalStrength).toBe(98);
    expect(state.systemIntegrity).toBe(100);
    expect(state.entityDistance).toBe(100);
    expect(state.flashlightOn).toBe(true);
    expect(state.flashlightPosition).toEqual({ x: 0.5, y: 0.5 });
  });

  it("should advance through the complete 8-beat narrative sequence deterministically", () => {
    let state: ExtendedGameState = { ...createInitialGameState(), systemState: "boot" };
    expect(state.systemState).toBe("boot");

    for (let i = 1; i < STATE_SEQUENCE.length; i++) {
      state = gameReducer(state, { type: "ADVANCE_STATE" });
      expect(state.systemState).toBe(STATE_SEQUENCE[i]);
    }

    expect(state.systemState).toBe("finalReveal");
    expect(state.signalStrength).toBe(0);
    expect(state.entityDistance).toBe(0);
  });

  it("should correctly switch cameras between 1 and 4, clamping invalid inputs", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "SWITCH_CAMERA", camera: 3 });
    expect(state.activeCamera).toBe(3);

    // Clamping checks
    state = gameReducer(state, { type: "SWITCH_CAMERA", camera: 10 });
    expect(state.activeCamera).toBe(4);

    state = gameReducer(state, { type: "SWITCH_CAMERA", camera: -2 });
    expect(state.activeCamera).toBe(1);
  });

  it("should prevent camera switching during systemFailure or finalReveal", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "SET_SYSTEM_STATE", state: "systemFailure" });
    expect(state.activeCamera).toBe(1);

    // Attempting to switch camera should be ignored
    state = gameReducer(state, { type: "SWITCH_CAMERA", camera: 4 });
    expect(state.activeCamera).toBe(1);
  });

  it("should update and clamp flashlight coordinates within [0, 1]", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "UPDATE_FLASHLIGHT", position: { x: 0.25, y: 0.75 } });
    expect(state.flashlightPosition).toEqual({ x: 0.25, y: 0.75 });

    state = gameReducer(state, { type: "UPDATE_FLASHLIGHT", position: { x: -0.5, y: 1.5 } });
    expect(state.flashlightPosition).toEqual({ x: 0, y: 1 });
  });

  it("should calculate progressive distance decay on tick during entityTracking", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "SET_SYSTEM_STATE", state: "entityTracking" });
    const initialDist = state.entityDistance;

    state = gameReducer(state, { type: "TICK", deltaSeconds: 2 });
    expect(state.entityDistance).toBeLessThan(initialDist);
  });

  it("should reset completely to initial state upon REBOOT", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "SET_SYSTEM_STATE", state: "finalReveal" });
    expect(state.systemState).toBe("finalReveal");

    state = gameReducer(state, { type: "REBOOT" });
    expect(state.systemState).toBe("normal");
    expect(state.signalStrength).toBe(98);
    expect(state.entityDistance).toBe(100);
  });

  it("should identify next state correctly", () => {
    expect(getNextSystemState("boot")).toBe("normal");
    expect(getNextSystemState("normal")).toBe("motionDetected");
    expect(getNextSystemState("motionDetected")).toBe("cameraGlitch");
    expect(getNextSystemState("finalReveal")).toBe("finalReveal");
  });

  it("should toggle audio mute cleanly in reducer", () => {
    let state = createInitialGameState();
    expect(state.isAudioMuted).toBe(false);

    state = gameReducer(state, { type: "TOGGLE_AUDIO" });
    expect(state.isAudioMuted).toBe(true);

    state = gameReducer(state, { type: "TOGGLE_AUDIO" });
    expect(state.isAudioMuted).toBe(false);
  });

  it("should drain battery when flashlight is on and recharge when off", () => {
    let state = createInitialGameState();
    expect(state.batteryLevel).toBe(100);
    expect(state.flashlightOn).toBe(true);

    // Drain over 10 seconds (3.5% / s = 35%)
    state = gameReducer(state, { type: "TICK", deltaSeconds: 10 });
    expect(state.batteryLevel).toBe(65);

    // Turn flashlight off
    state = gameReducer(state, { type: "TOGGLE_FLASHLIGHT" });
    expect(state.flashlightOn).toBe(false);

    // Recharge over 5 seconds (6.0% / s = 30%)
    state = gameReducer(state, { type: "TICK", deltaSeconds: 5 });
    expect(state.batteryLevel).toBe(95);

    // Drain to 0% and verify auto-shutoff
    state = gameReducer(state, { type: "TOGGLE_FLASHLIGHT" });
    state = gameReducer(state, { type: "TICK", deltaSeconds: 40 });
    expect(state.batteryLevel).toBe(0);
    expect(state.flashlightOn).toBe(false);

    // Verify flashlight cannot be turned on when battery is 0
    state = gameReducer(state, { type: "TOGGLE_FLASHLIGHT" });
    expect(state.flashlightOn).toBe(false);
  });

  it("should increase panic when entity is illuminated and decay when calm", () => {
    let state = createInitialGameState();
    expect(state.panicLevel).toBe(0);

    // Illuminate entity
    state = gameReducer(state, { type: "SET_ENTITY_ILLUMINATED", illuminated: true });
    state = gameReducer(state, { type: "TICK", deltaSeconds: 2 });
    expect(state.panicLevel).toBe(36); // 18% * 2

    // Un-illuminate entity and decay
    state = gameReducer(state, { type: "SET_ENTITY_ILLUMINATED", illuminated: false });
    state = gameReducer(state, { type: "TICK", deltaSeconds: 4 });
    expect(state.panicLevel).toBe(16); // 36 - (5 * 4) = 16
  });

  it("should switch active tabs between surveillance and dossier", () => {
    let state = createInitialGameState();
    expect(state.activeTab).toBe("surveillance");

    state = gameReducer(state, { type: "SET_ACTIVE_TAB", tab: "dossier" });
    expect(state.activeTab).toBe("dossier");

    state = gameReducer(state, { type: "SET_ACTIVE_TAB", tab: "surveillance" });
    expect(state.activeTab).toBe("surveillance");
  });
});

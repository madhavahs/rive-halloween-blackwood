import { SystemState } from "./types";
import { ExtendedGameState } from "./gameState";

export interface SequenceTimelineEvent {
  timeThresholdSeconds: number;
  targetState: SystemState;
  logTrigger?: string;
  autoCameraSwitch?: number;
}

// Scheduled narrative beats for hands-off autonomous horror flow (90 seconds total loop)
export const TIMELINE_SCHEDULE: SequenceTimelineEvent[] = [
  {
    timeThresholdSeconds: 12,
    targetState: "motionDetected",
    logTrigger: "[ALERT] MOTION DETECTED ON CAM 03 // ARCHIVUM",
    autoCameraSwitch: 3,
  },
  {
    timeThresholdSeconds: 24,
    targetState: "cameraGlitch",
    logTrigger: "[WARN] FEED SYNCHRONIZATION LOSS // SIGNAL ANOMALY",
  },
  {
    timeThresholdSeconds: 38,
    targetState: "entityVisible",
    logTrigger: "[CRITICAL] UNIDENTIFIED ENTITY DETECTED ON CAM 02",
    autoCameraSwitch: 2,
  },
  {
    timeThresholdSeconds: 52,
    targetState: "entityTracking",
    logTrigger: "[CRITICAL] ENTITY IN PURSUIT // APPROACHING CAM 01",
    autoCameraSwitch: 1,
  },
  {
    timeThresholdSeconds: 68,
    targetState: "systemFailure",
    logTrigger: "[FATAL] SURVEILLANCE INTERFACE CORRUPTED // OVERFLOW",
  },
  {
    timeThresholdSeconds: 82,
    targetState: "finalReveal",
    logTrigger: "[FATAL] CONNECTION SEVERED // IT SEES YOU",
  },
];

export function evaluateNextTimelineState(
  elapsedSeconds: number,
  currentState: SystemState
): SequenceTimelineEvent | null {
  for (const event of TIMELINE_SCHEDULE) {
    if (elapsedSeconds >= event.timeThresholdSeconds) {
      if (isStatePreceding(currentState, event.targetState)) {
        return event;
      }
    }
  }
  return null;
}

export function isStatePreceding(current: SystemState, target: SystemState): boolean {
  const order: SystemState[] = [
    "boot",
    "normal",
    "motionDetected",
    "cameraGlitch",
    "entityVisible",
    "entityTracking",
    "systemFailure",
    "finalReveal",
  ];
  return order.indexOf(current) < order.indexOf(target);
}

// Acceleration: if user shines flashlight directly at entity room or inspects anomaly camera, time accelerates
export function calculatePacingMultiplier(state: ExtendedGameState): number {
  if (state.systemState === "systemFailure" || state.systemState === "finalReveal") {
    return 1.0;
  }
  let multiplier = 1.0;
  // If user is watching the camera where anomaly is occurring
  if (state.activeCamera === state.entityCamera) {
    multiplier += 0.5;
  }
  // If flashlight is directly investigating center
  const dx = state.flashlightPosition.x - 0.5;
  const dy = state.flashlightPosition.y - 0.5;
  const distToCenter = Math.sqrt(dx * dx + dy * dy);
  if (distToCenter < 0.2 && state.flashlightOn) {
    multiplier += 0.5;
  }
  return multiplier;
}

import { SystemState, GameState } from "./types";

export interface ExtendedGameState extends GameState {
  logs: string[];
  entityCamera: number;
  flashlightOn: boolean;
  timeInState: number;
  isAudioMuted: boolean;
  batteryLevel: number;
  panicLevel: number;
  activeTab: "surveillance" | "dossier";
  isEntityIlluminated: boolean;
}

export type GameAction =
  | { type: "SWITCH_CAMERA"; camera: number }
  | { type: "UPDATE_FLASHLIGHT"; position: { x: number; y: number } }
  | { type: "TOGGLE_FLASHLIGHT" }
  | { type: "TOGGLE_AUDIO" }
  | { type: "SET_ACTIVE_TAB"; tab: "surveillance" | "dossier" }
  | { type: "SET_ENTITY_ILLUMINATED"; illuminated: boolean }
  | { type: "TICK"; deltaSeconds: number }
  | { type: "ADVANCE_STATE" }
  | { type: "SET_SYSTEM_STATE"; state: SystemState }
  | { type: "REBOOT" };

export const STATE_SEQUENCE: SystemState[] = [
  "boot",
  "normal",
  "motionDetected",
  "cameraGlitch",
  "entityVisible",
  "entityTracking",
  "systemFailure",
  "finalReveal",
];

export function getNextSystemState(current: SystemState): SystemState {
  const currentIndex = STATE_SEQUENCE.indexOf(current);
  if (currentIndex === -1 || currentIndex >= STATE_SEQUENCE.length - 1) {
    return current;
  }
  return STATE_SEQUENCE[currentIndex + 1]!;
}

export function createInitialGameState(): ExtendedGameState {
  return {
    systemState: "normal",
    activeCamera: 1,
    signalStrength: 98,
    systemIntegrity: 100,
    entityDistance: 100,
    flashlightPosition: { x: 0.5, y: 0.5 },
    logs: ["[SYS] TERMINAL BOOT SEQUENCE COMPLETE", "[SYS] MONITORING 4 SURVEILLANCE FEEDS"],
    entityCamera: 3,
    flashlightOn: true,
    timeInState: 0,
    isAudioMuted: false,
    batteryLevel: 100,
    panicLevel: 0,
    activeTab: "surveillance",
    isEntityIlluminated: false,
  };
}

export function gameReducer(state: ExtendedGameState, action: GameAction): ExtendedGameState {
  switch (action.type) {
    case "SWITCH_CAMERA": {
      if (state.systemState === "systemFailure" || state.systemState === "finalReveal") {
        return state; // Controls locked
      }
      const newCamera = Math.max(1, Math.min(4, action.camera));
      const hasEntity = newCamera === state.entityCamera;
      const logEntry = `[CAM 0${newCamera}] FEED CONNECTED ${hasEntity ? "// ANOMALY REGISTERED" : "// SIGNAL NOMINAL"}`;
      
      return {
        ...state,
        activeCamera: newCamera,
        logs: [...state.logs.slice(-4), logEntry],
      };
    }

    case "UPDATE_FLASHLIGHT": {
      return {
        ...state,
        flashlightPosition: {
          x: Math.max(0, Math.min(1, action.position.x)),
          y: Math.max(0, Math.min(1, action.position.y)),
        },
      };
    }

    case "TOGGLE_FLASHLIGHT": {
      if (!state.flashlightOn && state.batteryLevel <= 0) {
        return state;
      }
      return {
        ...state,
        flashlightOn: !state.flashlightOn,
      };
    }

    case "SET_ACTIVE_TAB": {
      return {
        ...state,
        activeTab: action.tab,
      };
    }

    case "SET_ENTITY_ILLUMINATED": {
      return {
        ...state,
        isEntityIlluminated: action.illuminated,
      };
    }

    case "TOGGLE_AUDIO": {
      return {
        ...state,
        isAudioMuted: !state.isAudioMuted,
      };
    }

    case "SET_SYSTEM_STATE": {
      return transitionToState(state, action.state);
    }

    case "ADVANCE_STATE": {
      const nextState = getNextSystemState(state.systemState);
      return transitionToState(state, nextState);
    }

    case "TICK": {
      const newTime = state.timeInState + action.deltaSeconds;
      
      // Dynamic adjustments based on state
      let { signalStrength, systemIntegrity, entityDistance } = state;
      
      if (state.systemState === "entityTracking") {
        entityDistance = Math.max(15, entityDistance - action.deltaSeconds * 4);
        signalStrength = Math.max(25, 60 - (100 - entityDistance) * 0.4);
      } else if (state.systemState === "systemFailure") {
        systemIntegrity = Math.max(0, systemIntegrity - action.deltaSeconds * 20);
        signalStrength = Math.max(10, signalStrength - action.deltaSeconds * 15);
      } else if (state.systemState === "finalReveal") {
        entityDistance = 0;
        signalStrength = 5;
        systemIntegrity = 0;
      }

      // Battery management
      let batteryLevel = state.batteryLevel;
      let flashlightOn = state.flashlightOn;
      if (flashlightOn) {
        batteryLevel = Math.max(0, batteryLevel - action.deltaSeconds * 3.5);
        if (batteryLevel === 0) {
          flashlightOn = false;
        }
      } else {
        batteryLevel = Math.min(100, batteryLevel + action.deltaSeconds * 6.0);
      }

      // Panic accumulation and recovery
      let panicLevel = state.panicLevel;
      if (state.isEntityIlluminated) {
        panicLevel = Math.min(100, panicLevel + action.deltaSeconds * 18.0);
      } else if (
        state.systemState === "entityTracking" ||
        state.systemState === "systemFailure" ||
        state.systemState === "finalReveal"
      ) {
        panicLevel = Math.min(100, panicLevel + action.deltaSeconds * 10.0);
      } else {
        panicLevel = Math.max(0, panicLevel - action.deltaSeconds * 5.0);
      }

      return {
        ...state,
        timeInState: newTime,
        flashlightOn,
        batteryLevel: Math.round(batteryLevel * 10) / 10,
        panicLevel: Math.round(panicLevel * 10) / 10,
        signalStrength: Math.round(signalStrength),
        systemIntegrity: Math.round(systemIntegrity),
        entityDistance: Math.round(entityDistance),
      };
    }

    case "REBOOT": {
      return createInitialGameState();
    }

    default:
      return state;
  }
}

function transitionToState(state: ExtendedGameState, newState: SystemState): ExtendedGameState {
  if (state.systemState === newState) return state;

  const logs = [...state.logs];

  switch (newState) {
    case "boot":
      return createInitialGameState();

    case "normal":
      logs.push("[SYS] SURVEILLANCE RUNNING // NO ANOMALIES");
      return {
        ...state,
        systemState: "normal",
        signalStrength: 98,
        systemIntegrity: 100,
        entityDistance: 100,
        timeInState: 0,
        logs: logs.slice(-5),
      };

    case "motionDetected":
      logs.push("[ALERT] MOTION DETECTED IN SECTOR 3 (ARCHIVUM)");
      return {
        ...state,
        systemState: "motionDetected",
        signalStrength: 82,
        entityDistance: 80,
        entityCamera: 3,
        timeInState: 0,
        logs: logs.slice(-5),
      };

    case "cameraGlitch":
      logs.push("[WARN] CAMERA SYNC FAILURE // PULSE DETECTED");
      return {
        ...state,
        systemState: "cameraGlitch",
        signalStrength: 54,
        timeInState: 0,
        logs: logs.slice(-5),
      };

    case "entityVisible":
      logs.push("[CRITICAL] UNKNOWN ENTITY RECORDED // VISUAL CONFIRMED");
      return {
        ...state,
        systemState: "entityVisible",
        signalStrength: 45,
        entityDistance: 50,
        entityCamera: 2, // Approaching West Hall
        timeInState: 0,
        logs: logs.slice(-5),
      };

    case "entityTracking":
      logs.push("[CRITICAL] ENTITY IN PURSUIT // DISTANCE DECAYING RAPIDLY");
      return {
        ...state,
        systemState: "entityTracking",
        entityCamera: 1, // Arrived at Foyer
        timeInState: 0,
        logs: logs.slice(-5),
      };

    case "systemFailure":
      logs.push("[ERR] INTEGRITY COMPROMISED // TERMINAL SEIZED");
      return {
        ...state,
        systemState: "systemFailure",
        signalStrength: 18,
        systemIntegrity: 15,
        entityDistance: 8,
        timeInState: 0,
        logs: logs.slice(-5),
      };

    case "finalReveal":
      logs.push("[FATAL] IT IS HERE // SYSTEM SEVERED");
      return {
        ...state,
        systemState: "finalReveal",
        signalStrength: 0,
        systemIntegrity: 0,
        entityDistance: 0,
        timeInState: 0,
        logs: logs.slice(-5),
      };

    default:
      return state;
  }
}

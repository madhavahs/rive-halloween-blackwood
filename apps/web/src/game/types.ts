export type SystemState =
  | "boot" | "normal" | "motionDetected" | "cameraGlitch"
  | "entityVisible" | "entityTracking" | "systemFailure" | "finalReveal";

export interface GameState {
  systemState: SystemState;
  activeCamera: number;
  signalStrength: number;
  systemIntegrity: number;
  entityDistance: number;
  flashlightPosition: { x: number; y: number };
}

export interface RiveController {
  boot(): void;
  setSystemState(state: SystemState): void;
  setActiveCamera(camera: number): void;
  setSignalStrength(value: number): void;
  setEntityDistance(value: number): void;
  triggerGlitch(): void;
  triggerFinalReveal(): void;
}

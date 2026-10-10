# BLACKWOOD: Product Specification

## 1. Executive Summary & Vision
- **Working Title:** BLACKWOOD — The House That Watches Back
- **Category:** Rive Halloween Challenge Entry (Interactive Horror / Surveillance Experience)
- **Format:** Single-page web experience running full-screen interactive surveillance terminal.
- **Tone:** Atmospheric psychological horror, technological decay, cosmic/spectral intrusion.
- **Tagline:** *"You thought you were monitoring the house. The house was monitoring you."*

## 2. Target Audience & Constraints
- **Platform:** Web browsers (Desktop primary 60 FPS, Mobile secondary 30–60 FPS with touch support).
- **Session Duration:** 2–3 minutes for complete narrative loop.
- **Replayability:** Deterministic yet high-tension loop with quick restart capability.
- **Compliance Rules:**
  1. Spooky / Haunted Halloween theme.
  2. MUST use **Rive CLI** AND **GPU Canvas**. Combining with **Scripting (Luau)**, **Data Binding**, and **State Machines** maximizes score (using all 5 pillars).
  3. Original work only. No unlicensed assets.
  4. Human art direction polish in Rive Editor.
  5. Detailed `BUILD_LOG.md` recording all CLI commands.

## 3. Core Experience Loop
```
BOOT 
  ↓
NORMAL (Investigating feeds 1-4)
  ↓
MOTION DETECTED (Alert sirens, static anomalies)
  ↓
CAMERA GLITCH (Feed corruption, flicker)
  ↓
ENTITY VISIBLE (Silhouette emerges in shadows)
  ↓
ENTITY TRACKING (Entity moves between cameras, stalks flashlight)
  ↓
SYSTEM FAILURE (Terminal sparks, controls lock, UI corrupted)
  ↓
FINAL REVEAL (Entity stares directly through screen, breaking 4th wall)
  ↓
RESTART / TERMINAL REBOOT
```

## 4. Narrative Story Beats
- **Beat 1: The Quiet Watch (0:00 - 0:25)**
  The user boots Blackwood Surveillance OS v4.1. Four camera feeds are available:
  - CAM 01: Foyer / Grand Staircase
  - CAM 02: West Hallway
  - CAM 03: Basement Archivum
  - CAM 04: Master Bedroom (Infrared)
  The user pans the flashlight cursor to inspect old Victorian furniture, flickering lamps, and decaying walls.
- **Beat 2: The Anomaly (0:25 - 0:50)**
  Audio shifts. Motion detector blinks red on CAM 03. Signal strength dips from 98% to 64%. An ominous shadow shifts when flashlight beam grazes the doorway.
- **Beat 3: Escalation & Tracking (0:50 - 1:20)**
  The entity actively stalks. Switching cameras reveals closer sightings. Luau script drives entity proximity ticks. Flashlight beam flickers under supernatural interference.
- **Beat 4: Terminal Seizure (1:20 - 1:45)**
  Audio distortion intensifies. UI buttons glitch and pull toward cursor. System integrity drops to 0%. Screen fills with eerie terminal log entries ("IT SEES YOU", "SIGNAL ACQUIRED").
- **Beat 5: The Climax / Final Reveal (1:45 - 2:00)**
  All feeds collapse into a unified terrifying visual: the entity's face occupies the terminal screen, its spectral eyes locking directly onto the cursor. Sudden blackout, final static pulse, and "CONNECTION SEVERED - REBOOT TERMINAL" prompt.

## 5. Domain State Model

### SystemState
```typescript
export type SystemState =
  | "boot"
  | "normal"
  | "motionDetected"
  | "cameraGlitch"
  | "entityVisible"
  | "entityTracking"
  | "systemFailure"
  | "finalReveal";
```

### EntityState
```typescript
export type EntityState =
  | "idle"
  | "hidden"
  | "watching"
  | "approaching"
  | "possessed"
  | "reveal";
```

### GameState
```typescript
export interface GameState {
  systemState: SystemState;
  activeCamera: number;
  signalStrength: number;
  systemIntegrity: number;
  entityDistance: number;
  flashlightPosition: { x: number; y: number };
}
```

## 6. Exit Gate for M02
- Product specification documented without ambiguity.
- State machines and narrative beats mapped to Rive and React interfaces.

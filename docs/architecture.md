# BLACKWOOD: Architecture Specification

## 1. System Overview & Boundaries

The architecture maintains strict separation of concerns across four primary tiers:
```
┌────────────────────────────────────────────────────────┐
│            React / Vite Shell (TypeScript)             │
│  - Application Lifecycle & Audio Engine Manager        │
│  - Input Coordinate Normalization (Pointer / Touch)    │
│  - System State Progression Orchestration              │
│  - Accessibility, HUD Overlays, Fullscreen Shell       │
└──────────────────────────┬─────────────────────────────┘
                           │ Typed Interface (RiveController)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Rive Runtime & Canvas                    │
│  - State Machines (System, Entity, Camera, UI)         │
│  - View Model Data Binding (Game ViewModel)            │
│  - Luau Embedded Scripting (Proximity / Ticks / Logs)  │
│  - Vector Art, Bones, IK, Timeline Animations          │
└──────────────────────────┬─────────────────────────────┘
                           │ Canvas Context / Shading Pass
                           ▼
┌────────────────────────────────────────────────────────┐
│              GPU Canvas & WGSL Shaders                 │
│  - Flashlight Cone & Darkness Mask                     │
│  - Volumetric Fog & Particle Drift                     │
│  - CRT Scanlines, Barrel Distortion & Phosphor Decay   │
│  - Glitch Artifacts & Spectral Chromatic Aberration    │
└────────────────────────────────────────────────────────┘
```

## 2. Component Structure
- `apps/web/src/app/App.tsx`: Top-level mount, full-screen canvas wrapper, sound init prompt.
- `apps/web/src/components/TerminalHUD.tsx`: Monospace surveillance telemetry (CAM label, signal %, REC blinker, logs).
- `apps/web/src/components/AudioController.ts`: Web Audio API synthesizer for ambient drone, glitch clicks, static jumps.
- `apps/web/src/rive/RiveCanvas.tsx`: Rive canvas integration lifecycle, resize observer, pointer dispatch.
- `apps/web/src/game/gameState.ts`: Pure functional state reducer for deterministic progression.
- `apps/web/src/game/types.ts`: Discriminated unions, `SystemState`, `GameState`, `RiveController`.
- `apps/web/src/shaders/`: WGSL shader strings and fallback rendering mechanisms.

## 3. Rive & Data Binding Contract

### ViewModel: `Game`
The Rive scene binds to a root ViewModel named `Game`:
- `systemState` (Enum: 0=boot, 1=normal, 2=motionDetected, 3=cameraGlitch, 4=entityVisible, 5=entityTracking, 6=systemFailure, 7=finalReveal)
- `activeCamera` (Number: 1, 2, 3, 4)
- `signalStrength` (Number: 0..100)
- `systemIntegrity` (Number: 0..100)
- `entityDistance` (Number: 0..100, where 0 is right in front of lens)
- `logLine` (String: current terminal status text)
- `glitchTrigger` (Trigger: fires instantaneous visual corruption)
- `revealTrigger` (Trigger: transitions to full-screen entity reveal)

### Scripting (Luau) Responsibilities
Luau scripts embedded within the Rive project handle:
1. `entity_behavior.luau`: Internal proximity decay algorithm when flashlight moves away.
2. `terminal_log.luau`: Narrative log feed string generation based on state machine events.
3. `flicker_logic.luau`: Micro-timing variance for surveillance lights and camera artifacts.

## 4. GPU & WGSL Effects Pipeline
1. **Pass 1: Flashlight Mask (`shaders/flashlight.wgsl`)**
   Renders dynamic spotlight cone following normalized `(x, y)` pointer coordinates with soft penumbra and ambient darkness mask.
2. **Pass 2: Atmospheric Fog (`shaders/fog.wgsl`)**
   Simulates procedural Perlin/Simplex noise fog drifting across security cameras.
3. **Pass 3: CRT Post-Processing (`shaders/crt.wgsl`)**
   Subtle barrel distortion, horizontal scanlines, RGB phosphor triad mask, and vignette.
4. **Pass 4: Glitch & Chromatic Aberration (`shaders/distortion.wgsl`)**
   Displacement triggered during `cameraGlitch`, `systemFailure`, and `finalReveal`.

## 5. Architectural Invariants
- No React state directly inside Rive animation loops.
- All Rive interactions happen via typed `RiveController` methods.
- Shaders compile with WebGPU / GPU Canvas when supported, and gracefully degrade to standard 2D canvas composite modes if WebGPU is unavailable.
- Tests independently verify state reducers without requiring browser DOM or WebGL context.

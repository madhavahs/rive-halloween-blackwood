# BLACKWOOD: Comprehensive Build Log & CLI Audit Trail

This build log documents all CLI operations, Rive compiler invocations, architectural decisions, and verification gates executed during the creation of **BLACKWOOD — The House That Watches Back** for the Rive Halloween Challenge.

---

## Milestone M01 — Bootstrap Workspace & Tooling
- **`rive doctor`**: Verified Rive CLI 1.4.0 toolchain installation on Windows (`C:\Users\Madhav\.rive\bin\rive.exe`), checking runtime paths and compiler dependencies.
- **`rive create rive/rml`**: Scaffolded the Rive fragment project structure containing `rive.yaml` and baseline `scene.rml`.
- **Tooling Setup**: Initialized React 19 + Vite 8 + TypeScript strict mono-repo in `blackwood/` with Vitest and Playwright.
- **Agent Governance**: Authored rules 01 through 10 in `.agents/rules/` establishing quality gates and development protocol.

---

## Milestone M02 — Product Specification & Architecture
- **`docs/product-spec.md`**: Defined the 8 narrative beats (`boot`, `normal`, `motionDetected`, `cameraGlitch`, `entityVisible`, `entityTracking`, `systemFailure`, `finalReveal`), contest evaluation matrix, and audio-visual design goals.
- **`docs/architecture.md`**: Specified 4-tier separation of concerns: React Application Shell, Typed `RiveController` boundary, Rive Runtime Canvas, and GPU Atmospheric Shading Pass.
- **`docs/interaction-spec.md`**: Specified flashlight beam trigonometry, normalized coordinate mapping `[0, 1]`, and hotkey contracts.
- **`docs/visual-system.md`**: Defined monospace typography tokens, phosphor greens, and alarm crimson palettes.
- **`docs/deployment.md`**: Outlined static hosting targets and asset size budgets (< 2MB).

---

## Milestone M03 — Rive Prototype & Assets
- **`rive schema DataEnumCustom`**: Inspected CLI schema definition to ensure valid RML syntax for custom enum declarations in ViewModels.
- **`rive schema ViewModelProperty*`**: Validated schema property types for numbers, booleans, strings, and triggers.
- **`rive schema ScriptedLayout`**: Inspected layout binding syntax for embedding Luau script components.
- **`rive rive/rml --verify`**: Built and verified `rive/rml/scene.rml` and `rive/rml/terminal.luau` with 0 errors and 0 warnings.
- **`rive rive/rml --screenshot --advance=1`**: Rendered frame 1 to `rive/rml/build/rml.png` and exported production binary to `apps/web/public/rive/blackwood.riv` (4.41 KB).
- **`docs/rive-contract.md`**: Formally documented the ViewModel `Game` property inputs and triggers.

---

## Milestone M04 — Runtime Integration
- **`useRiveController.ts`**: Connected `@rive-app/canvas` runtime to React with a strictly typed `RiveController` interface.
- **Data Binding Synchronization**: Mapped state inputs (`stateIndex`, `activeCamera`, `signalStrength`, `entityDistance`) and triggers (`glitch`, `reveal`) directly to Rive view model properties.
- **Headless Browser Verification**: Verified runtime canvas mount via Playwright and captured [`shots/m04-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m04-browser-verify.png).

---

## Milestone M05 — State Machine & Game Engine
- **`gameState.ts`**: Implemented a pure functional state reducer managing 8 narrative states, active camera clamping (1–4), signal integrity decay, entity proximity, and system reboot.
- **Vitest Unit Suite**: Authored 9 unit tests in `gameState.test.ts` covering state transitions, clamping, and reboot resets.
- **Browser Verification**: Tested UI telemetry updates and captured [`shots/m05-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m05-browser-verify.png).

---

## Milestone M06 — Flashlight Interaction
- **`FlashlightOverlay.tsx`**: Built pointer-driven flashlight beam using HTML5 Canvas 2D radial gradient with quadratic falloff penumbra.
- **Flicker Mathematics**: Authored deterministic proximity flicker algorithm that triggers stochastic beam oscillations when entity distance decays under 30%.
- **Keyboard Shortcuts**: Added global hotkeys (1–4 for cameras, Space/F for flashlight, R for reboot) in `useKeyboardShortcuts.ts`.
- **Browser Verification**: Verified touch drag and mouse pointer mechanics and captured [`shots/m06-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m06-browser-verify.png).

---

## Milestone M07 — GPU Effects & WGSL Shaders
- **WGSL Shaders Authored**:
  - `shaders/flashlight.wgsl`: Inverse-square spotlight falloff with darkness ambient mask.
  - `shaders/fog.wgsl`: Procedural drifting volumetric mist wave.
  - `shaders/crt.wgsl`: CRT scanline grid, barrel distortion curvature, and phosphor mask.
  - `shaders/distortion.wgsl`: Chromatic glitch aberration and horizontal tear displacement.
- **Intelligent Procedural Fallback**: Implemented WebGPU hardware detection in `webgpuPipeline.ts` with automatic 60 FPS 2D canvas procedural fallback in `ShaderCanvas.tsx`.
- **Browser Verification**: Captured [`shots/m07-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m07-browser-verify.png).

---

## Milestone M08 — Horror Sequence & Narrative Progression
- **`sequenceOrchestrator.ts`**: Built autonomous horror timeline loop with deterministic thresholds across 82 seconds.
- **Dynamic Pacing Acceleration**: Accelerated timeline progression by up to 2.0x when the user investigates anomaly rooms with the flashlight.
- **Browser Verification**: Verified autonomous progression to climax state and captured [`shots/m08-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m08-browser-verify.png).

---

## Milestone M09 — Audio & Sensory Polish
- **`SoundEngine.ts`**: Implemented zero-asset procedural Web Audio API synthesizer:
  - Sub-bass ambient drone (48Hz/52Hz binaural beating).
  - Mechanical relay clicks and tactile flashlight snaps.
  - Modulated bandpass white noise static bursts.
  - Climactic dissonant chord cluster (55Hz, 58Hz, 82Hz) + exponential sub-bass drop for `finalReveal`.
- **HUD Audio Controls**: Added `AUDIO: ON / MUTED [M]` toggle button and hotkey `M` with unified reducer action `TOGGLE_AUDIO`.
- **Browser Verification**: Captured [`shots/m09-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m09-browser-verify.png).

---

## Milestone M10 — Comprehensive QA & Test Suite
- **Playwright E2E Suite (`apps/web/tests/e2e.spec.ts`)**: Validated full narrative lifecycle from boot to final reveal, button locking, touch drag, and reboot across Desktop (1280x800) and Mobile (390x844).
- **Accessibility Suite (`apps/web/tests/accessibility.spec.ts`)**: Validated ARIA landmarks (`role="region"`, `role="status"`, `role="log"`, `aria-live="polite"`, `role="alert"`), descriptive button labels, and `prefers-reduced-motion` compliance.
- **Test Metrics**: 26/26 Vitest unit tests passed; 7/7 Playwright tests passed with 0 console errors.

---

## Milestone M11 — Deployment & Production Build
- **`scripts/verify-build-budget.mjs`**: Automated asset budget audit verifying production bundle sizes:
  - Total uncompressed: 0.439 MB (< 2.0 MB budget)
  - Total gzipped: 0.130 MB (< 0.5 MB budget)
  - JavaScript gzipped: 130.88 KB (< 350 KB budget)
  - Rive binary: 4.41 KB (< 100 KB budget)
- **Deployment Configurations**: Authored `vercel.json`, `apps/web/public/_headers`, and `apps/web/public/_redirects` with immutable caching and security headers.
- **Production Preview**: Tested static standalone serving via Playwright on port 4173 with 0 errors.

---

## Milestone M12 — Contest Submission Package
- **`README.md`**: Compiled competition submission overview, contest criteria alignment matrix, controls, narrative loop, architecture, and verification gallery.
- **Release Tagging**: Tagged final competition release: `v1.0-submission`.

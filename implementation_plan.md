# BLACKWOOD: Master Implementation Plan (M01 – M12)

This plan strictly follows the execution protocol established in `Antigravity_Blackwood_Workflow.docx`:
`SPEC → PLAN → IMPLEMENT → TEST → BROWSER VERIFY → REVIEW → COMMIT → NEXT MILESTONE`.

---

## Milestone Index & Verification Gates

### Milestone M01 — Bootstrap Workspace & Tooling [COMPLETED]
- **Scope:**
  - Verify node (>=20), npm, git, curl, rive CLI on Windows host.
  - Establish mono-repo workspace architecture under `blackwood/`.
  - Install dependencies: `react`, `@rive-app/canvas`, `vite`, `typescript`, `vitest`, `eslint`, `typescript-eslint`, `@playwright/test`.
  - Set up agent governance rules (`.agents/rules/01-10`).
  - Initialize baseline Rive project (`rive create rive/rml`).
- **Exit Gate:**
  - `npm run typecheck && npm run lint && npm run test && npm run build` passes with zero errors.
  - `rive rive/rml --verify` returns 0 errors.

---

### Milestone M02 — Product Specification & Architecture Documentation [IN PROGRESS]
- **Scope:**
  - Create `docs/product-spec.md` with complete narrative arc and state models.
  - Create `docs/architecture.md` with strict boundaries between React, Rive, WGSL, and Web Audio.
  - Create `docs/interaction-spec.md` with flashlight coordinate handling and keyboard shortcuts.
  - Create `docs/visual-system.md` with CRT surveillance HUD tokens and color palette.
  - Create `docs/deployment.md` with asset budgets and browser fallbacks.
  - Create `implementation_plan.md` master plan.
- **Exit Gate:**
  - Architectural documents are fully drafted, mutually consistent, and approved.
  - No ambiguous requirements in core loop.

---

### Milestone M03 — Rive Prototype & Assets
- **Scope:**
  - Create `scene.rml` surveillance layout in `rive/rml/`.
  - Define root ViewModel `Game` with inputs (`systemState`, `activeCamera`, `signalStrength`, `systemIntegrity`, `entityDistance`, `logLine`, `glitchTrigger`, `revealTrigger`).
  - Implement Luau scripting for entity behavior ticks and story progression.
  - Export and build Rive file.
- **Files to Change:**
  - `rive/rml/scene.rml`
  - `rive/rml/rive.yaml`
  - `docs/rive-contract.md`
- **Verification Gate:**
  - `rive rive/rml --verify` passes without schema errors or warnings.
  - Evidence screenshot captured using `rive rive/rml --screenshot`.

---

### Milestone M04 — Runtime Integration
- **Scope:**
  - Create React component `RiveCanvas.tsx` wrapping `@rive-app/canvas`.
  - Build typed `RiveController` implementation connecting React state to Rive State Machine inputs and ViewModel properties.
  - Handle container resizing and DPR scaling.
- **Files to Change:**
  - `apps/web/src/rive/RiveCanvas.tsx`
  - `apps/web/src/rive/useRiveController.ts`
  - `apps/web/src/app/App.tsx`
- **Verification Gate:**
  - Rive canvas mounts cleanly in React without canvas context loss.
  - TypeScript strict mode passes.

---

### Milestone M05 — State Machine & Game Engine
- **Scope:**
  - Implement pure functional state machine in `apps/web/src/game/gameState.ts`.
  - Implement transition triggers (`boot` → `normal` → `motionDetected` → `cameraGlitch` → `entityVisible` → `entityTracking` → `systemFailure` → `finalReveal`).
  - Unit test all deterministic transitions with Vitest.
- **Files to Change:**
  - `apps/web/src/game/gameState.ts`
  - `apps/web/src/game/gameState.test.ts`
- **Verification Gate:**
  - 100% of state transition unit tests pass via `npm run test -w apps/web`.

---

### Milestone M06 — Flashlight Interaction
- **Scope:**
  - Pointer movement capture with normalized coordinates `[0, 1]`.
  - Touch input handling for mobile screens with smooth interpolation.
  - Pass flashlight coordinates to state machine and Rive/shader layers.
  - Flashlight battery / toggle button.
- **Files to Change:**
  - `apps/web/src/components/FlashlightManager.ts`
  - `apps/web/src/components/TerminalHUD.tsx`
- **Verification Gate:**
  - Desktop mousemove and touch drag smoothly update coordinates.
  - No frame drops or unbounded event listeners.

---

### Milestone M07 — GPU Effects & WGSL Shaders
- **Scope:**
  - Implement `shaders/flashlight.wgsl` (dynamic cone & darkness mask).
  - Implement `shaders/fog.wgsl` (procedural drifting fog).
  - Implement `shaders/crt.wgsl` (scanlines, barrel curve, phosphor decay).
  - Implement `shaders/distortion.wgsl` (chromatic glitch aberration).
  - Graceful Canvas 2D / CSS fallback for browsers without WebGPU.
- **Files to Change:**
  - `shaders/*.wgsl`
  - `apps/web/src/shaders/ShaderPipeline.ts`
- **Verification Gate:**
  - Shaders render expected visual effects; fallback operates smoothly on non-WebGPU setups.

---

### Milestone M08 — Horror Sequence & Climax Reveal
- **Scope:**
  - Wire timeline triggers and entity stalking logic between camera feeds.
  - Implement terminal corruption sequence and jump to `finalReveal`.
  - Implement reboot button to reset state back to `boot`.
- **Files to Change:**
  - `apps/web/src/game/sequenceOrchestrator.ts`
  - `apps/web/src/app/App.tsx`
- **Verification Gate:**
  - Complete play-through from initial boot to final reveal executes seamlessly.

---

### Milestone M09 — Audio & Polish
- **Scope:**
  - Implement Web Audio synthesizer for ambient drone, camera switch clicks, static hiss, and jumpscare stinger.
  - Fine-tune visual easing, UI typography, and audio-visual synchrony.
- **Files to Change:**
  - `apps/web/src/audio/SoundEngine.ts`
- **Verification Gate:**
  - Audio triggers deterministically in response to state transitions without lag or audio clipping.

---

### Milestone M10 — Comprehensive QA & Test Suite
- **Scope:**
  - Playwright E2E test verifying end-to-end user loop across desktop (1280x800) and mobile (390x844).
  - Verification of accessibility (`prefers-reduced-motion`, aria live tags).
  - Performance audit verifying steady 60 FPS desktop / 30-60 FPS mobile.
- **Files to Change:**
  - `apps/web/tests/e2e.spec.ts`
  - `apps/web/tests/accessibility.spec.ts`
- **Verification Gate:**
  - `npx playwright test` passes with zero failures. Zero P0/P1 bugs.

---

### Milestone M11 — Production Deployment
- **Scope:**
  - Production build verification (`npm run build -w apps/web`).
  - Inspect production bundle sizes, assets paths, and offline fallbacks.
  - Deployment configuration for Cloudflare Pages / Vercel.
- **Verification Gate:**
  - Clean production build under asset budgets; deployable without errors.

---

### Milestone M12 — Competition Submission Package
- **Scope:**
  - Compile final `BUILD_LOG.md` recording all Rive CLI operations.
  - Record 30–60s demonstration walkthrough.
  - Take high-resolution screenshots for Contra submission.
  - Final git tag `v1.0-submission`.
- **Exit Gate:**
  - All competition deliverables complete according to Contra challenge rules.

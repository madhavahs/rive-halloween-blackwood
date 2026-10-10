# BLACKWOOD — The House That Watches Back

> **An interactive horror surveillance terminal authored for the Rive Halloween Challenge.**  
> *Built with Rive CLI, RML Text Authoring, Luau Scripting, Data Binding, State Machines, WebGPU Shaders, and Procedural Web Audio.*

[![Rive Verified](https://img.shields.io/badge/Rive_CLI-1.4.0_Verified-33ff77?style=flat-square)](https://rive.app)
[![Vitest](https://img.shields.io/badge/Unit_Tests-26%2F26_Passing-33ff77?style=flat-square)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright_E2E-7%2F7_Passing-33ff77?style=flat-square)](https://playwright.dev)
[![Bundle Size](https://img.shields.io/badge/Bundle_Size-0.44MB_(130KB_gzip)-33ff77?style=flat-square)](#performance--asset-budget)

---

## 1. Overview & Concept

You are the night security operator at the abandoned **Blackwood Estate**. Your terminal monitors 4 closed-circuit feeds across the estate:
- **CAM 01 // FOYER** — Grand entrance and stairwell.
- **CAM 02 // WEST HALL** — Long corridor lined with locked portraits.
- **CAM 03 // ARCHIVUM** — Subterranean library and occult containment.
- **CAM 04 // MASTER BED** — Upper quarters; dormant... until now.

As the night progresses, motion anomalies emerge. Shifting your searchlight reveals fleeting shadows, feed synchronizations begin dropping, and a presence stalks from room to room until the surveillance terminal itself is violently compromised.

---

## 2. Contest Evaluation Matrix

| Contest Requirement | Implementation in BLACKWOOD | Location |
| :--- | :--- | :--- |
| **Rive CLI Workflow** | Full project authored via Rive CLI (`rive create`, `rive schema`, `rive --verify`, `rive --screenshot`). | [`rive/rml/`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/rive/rml), [`BUILD_LOG.md`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/BUILD_LOG.md) |
| **RML Text Authoring** | Vector art, bones, and layouts written entirely in RML (Rive Markup Language). | [`rive/rml/scene.rml`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/rive/rml/scene.rml) |
| **Luau Scripting** | Embedded Luau scripts handle proximity decay, micro-timing variance, and feed telemetry. | [`rive/rml/terminal.luau`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/rive/rml/terminal.luau) |
| **Data Binding** | Root ViewModel `Game` bound to system states, camera feeds, integrity counters, and triggers. | [`docs/rive-contract.md`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/docs/rive-contract.md) |
| **State Machines** | 8 narrative beats mapped into state machine inputs (`stateIndex`, `glitch`, `reveal`). | [`apps/web/src/rive/useRiveController.ts`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/apps/web/src/rive/useRiveController.ts) |
| **GPU Canvas & Shaders** | 4 WGSL shaders (Flashlight, Fog, CRT scanlines, Glitch) + procedural 2D canvas fallback. | [`apps/web/src/shaders/`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/apps/web/src/shaders) |
| **Procedural Audio** | Zero-asset Web Audio API synthesizer for binaural drone, relay clicks, static, and horror stinger. | [`apps/web/src/audio/SoundEngine.ts`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/apps/web/src/audio/SoundEngine.ts) |
| **Accessibility & QA** | ARIA live regions, `prefers-reduced-motion` detection, Playwright desktop + mobile test suites. | [`apps/web/tests/`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/apps/web/tests) |

---

## 3. Controls & Interaction

- **Flashlight (Pointer / Touch):** Move your mouse or drag on touchscreen to shine the spotlight beam through the darkness.
- **Camera Selection (`1`, `2`, `3`, `4`):** Switch between CCTV feeds (locked during system compromise).
- **Toggle Flashlight (`F` or `Space`):** Turn spotlight beam on or off.
- **Audio Mute (`M`):** Toggle procedural audio synthesis on or off.
- **Advance Story Beat (`ADVANCE BEAT` button):** Manually step through narrative tension phases.
- **Reboot Terminal (`R` or `REBOOT TERMINAL` button):** Resets terminal telemetry back to nominal state after failure.

---

## 4. Narrative Sequence

The game loop runs through an autonomous 8-beat progression:
1. **`boot`**: Surveillance terminal cold boot and hardware handshake.
2. **`normal`**: Nominal feeds, ambient CRT hum, and sub-bass binaural drone (48Hz/52Hz).
3. **`motionDetected`**: Infrared tripwire trigger on CAM 03 Archivum.
4. **`cameraGlitch`**: High-frequency static bursts and chromatic CRT scanline distortion.
5. **`entityVisible`**: Physical anomaly manifests; signal integrity starts decaying.
6. **`entityTracking`**: Entity stalks toward CAM 01; proximity flickers intensify.
7. **`systemFailure`**: Feed synchronization drops to 0%; camera controls lock.
8. **`finalReveal`**: Connection severed; full-screen horror stinger chord + visual climax.

---

## 5. Architectural Invariants

```
┌─────────────────────────────────────────────────────────────────┐
│                    React / Vite Application                     │
│  - Pure Functional State Reducer (gameState.ts)                 │
│  - Autonomous Narrative Sequence Orchestrator                   │
│  - Procedural Web Audio Engine (SoundEngine.ts)                 │
│  - Accessibility Telemetry & ARIA Live Regions (TerminalOverlay) │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Typed Interface (RiveController)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Rive Web Runtime Canvas                     │
│  - ViewModel 'Game' (Data Binding inputs & triggers)            │
│  - Embedded Luau Scripting (terminal.luau proximity tick)       │
│  - Vector Art, Bones & Timelines (scene.rml -> blackwood.riv)   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Shading Pass (WebGPU / 2D Canvas)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Atmospheric Shader Canvas                    │
│  - Pass 1: Flashlight Cone & Inverse Square Falloff             │
│  - Pass 2: Volumetric Mist & Drifting Fog Wave                  │
│  - Pass 3: CRT Scanlines & Barrel Distortion                    │
│  - Pass 4: Chromatic Aberration & Glitch Displacement           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Verification & Test Commands

Every milestone in the 12-milestone roadmap has been strictly validated through automated CI gates:

```bash
# 1. Run all static verification gates (Typecheck, Lint, Vitest, Build, Budget, Rive CLI)
bash scripts/verify-gates.sh

# 2. Run unit tests independently
npm run test -w apps/web

# 3. Run Playwright E2E and Accessibility test suite
npm run e2e

# 4. Run production asset budget audit
node scripts/verify-build-budget.mjs

# 5. Serve production build preview locally
npm run preview
```

---

## 7. Performance & Asset Budget

Because BLACKWOOD relies on **RML text-authored Rive files**, **WGSL mathematical shaders**, and **procedural Web Audio API synthesis**, the total production build size is astonishingly lightweight:

| Asset | File Size | Gzipped Size | Budget Target | Status |
| :--- | :--- | :--- | :--- | :--- |
| `dist/assets/index-*.js` | 443.88 KB | 130.88 KB | < 350.00 KB | **PASSED (62% under budget)** |
| `dist/rive/blackwood.riv` | 4.41 KB | 2.13 KB | < 100.00 KB | **PASSED (95% under budget)** |
| `dist/index.html` | 0.31 KB | 0.25 KB | < 10.00 KB | **PASSED** |
| **Total Production Bundle** | **0.439 MB** | **0.130 MB** | **< 2.000 MB** | **PASSED (78% under budget)** |

---

## 8. Verification Gallery

- **M03 Prototype:** [`shots/m03-prototype.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m03-prototype.png) — Initial RML layout and ViewModel validation.
- **M04 Runtime Integration:** [`shots/m04-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m04-browser-verify.png) — React + Rive Canvas runtime mount.
- **M05 State Progression:** [`shots/m05-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m05-browser-verify.png) — Telemetry HUD and state sequence.
- **M06 Flashlight Interaction:** [`shots/m06-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m06-browser-verify.png) — Pointer-driven spotlight and penumbra falloff.
- **M07 GPU Shaders:** [`shots/m07-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m07-browser-verify.png) — Atmospheric fog, CRT scanlines, and glitch tear.
- **M08 Narrative Progression:** [`shots/m08-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m08-browser-verify.png) — Orchestrated horror timeline and climax.
- **M09 Audio & Polish:** [`shots/m09-browser-verify.png`](file:///c:/Users/Madhav/OneDrive/Desktop/contra/blackwood/shots/m09-browser-verify.png) — Integrated procedural audio controls and visual polish.

---

## 9. Contest Entry Metadata
- **Project Name:** BLACKWOOD — The House That Watches Back
- **Author:** Madhav
- **Challenge:** Rive Halloween Challenge (Contra)
- **Engine / Runtime:** Rive CLI 1.4.0 + `@rive-app/canvas` 2.44.0 + WebGPU + Web Audio API
- **License:** MIT

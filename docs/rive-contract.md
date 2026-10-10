# BLACKWOOD: Rive Contract Documentation

## 1. Scene Overview
- **Artboard:** `Terminal` (1280 x 800)
- **Rive Source File:** `rive/rml/scene.rml`
- **Embedded Script:** `rive/rml/terminal.luau`
- **Compiled Binary:** `apps/web/public/rive/blackwood.riv` and `rive/exported/blackwood.riv`

## 2. State Machine: `System`
- **Default State Machine:** `System` (auto-played on load)
- **Layers:**
  - `BaseLayer`: Controls progression between `Idle`, `Glitch`, and `Reveal` animation states.

### State Machine Inputs
| Input Name | Type | Acceptable Values | Description |
|------------|------|-------------------|-------------|
| `stateIndex` | Number | `0` to `7` | Discriminated numeric index for `SystemState` |
| `activeCamera` | Number | `1`, `2`, `3`, `4` | Currently selected surveillance camera feed |
| `entityDistance` | Number | `0` to `100` | Proximity of entity to surveillance lens |
| `glitch` | Trigger | Fire callback | Triggers rapid displacement and CRT jitter |
| `reveal` | Trigger | Fire callback | Triggers terminal takeover and final entity reveal |

## 3. Data Binding ViewModel: `Game`
The root artboard binds to ViewModel `Game`:
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `activeCamera` | Number | `1` | Camera feed index |
| `signalStrength` | Number | `98` | Analog signal integrity percentage (0..100) |
| `systemIntegrity`| Number | `100`| Surveillance system health percentage (0..100) |
| `entityDistance` | Number | `100`| Distance to approaching entity (0 = direct screen contact) |
| `logLine` | String | `"SYSTEM READY - CAM 01 ONLINE"` | Current rolling terminal message |
| `glitchTrigger` | Trigger | — | Event trigger for glitch burst |
| `revealTrigger` | Trigger | — | Event trigger for terminal takeover climax |

## 4. Timelines & Animations
- `Idle` (120 frames, loop): Subtle spectral eye intensity modulation and room shadow breathing.
- `Glitch` (30 frames, one-shot): Violent horizontal jitter and chromatic offset.
- `Reveal` (90 frames, one-shot): Entity scale surge from 1.0x to 2.5x with maximum eye glow.

## 5. Embedded Luau Script: `terminal.luau`
- Implements `Layout<TerminalScript>`
- Renders real-time procedural CCTV HUD reticle, crosshairs, and corner brackets directly inside the Rive canvas.
- Drives procedural sweep and tracking telemetry.

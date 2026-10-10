# BLACKWOOD: Visual System & Art Direction

## 1. Aesthetic Identity: Haunted Security Terminal
BLACKWOOD avoids generic cartoon Halloween tropes in favor of chilling technical realism: an outdated CCTV surveillance station from the early 1990s installed in an abandoned Victorian estate.

## 2. Color Palette Tokens
| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--bg-void` | `#050308` | Background Base | Terminal darkness, outer letterbox |
| `--cctv-green` | `#33ff77` | Primary Phosphor | Camera HUD, timestamps, normal telemetry |
| `--cctv-amber` | `#ffb833` | Warning Phosphor | Motion alert indicators, warning logs |
| `--corrupt-red`| `#ff2a4b` | Hazard / Entity | Glitch spikes, low integrity, entity eyes |
| `--monochrome-cctv`| `#a6b4a9` | Camera Feed Base | Greyscale architectural structures & furniture |
| `--beam-light` | `#fff8e7` | Flashlight Core | Spotlight center illumination |

## 3. Typography
- **Primary HUD:** Clean monospaced typeface (`ui-monospace, "SF Mono", "Courier New", monospace`).
- **Telemetry Glyphs:** Fixed-width tabular figures (`font-variant-numeric: tabular-nums`) to prevent jitter during real-time value updates.
- **Glitch Glyphs:** Zalgo / unicode glitch block corruption used selectively during terminal seizure.

## 4. Surveillance HUD Elements
- **Timestamp:** ISO-style real-time running clock `2026-10-31 03:42:19 EST` with pulsing red `● REC` indicator.
- **Feed Identification:** `CAM 01 // FOYER`, `CAM 02 // WEST HALL`, `CAM 03 // ARCHIVUM`, `CAM 04 // MASTER BED`.
- **Signal Gauge:** Segmented vertical LED bar (10 segments) reflecting `signalStrength`.
- **Integrity Bar:** Horizontal warning bar reflecting `systemIntegrity`.
- **Terminal Log Stream:** 3-line rolling terminal output at the bottom left displaying system events.

## 5. Shader Atmosphere & Shading Guidelines
- **Noise Grain:** Subtle dynamic perlin grain simulating high-gain CCTV analog sensors in low light.
- **Vignette:** Heavy radial vignette darkening the frame corners to evoke claustrophobia.
- **Fog Density:** Soft horizontal layering in basement/hallway cameras to create depth and obscure the approaching entity.

# BLACKWOOD: Interaction Specification

## 1. Input Controls

### Desktop
- **Pointer Movement:** Controls the flashlight beam position `(x, y)` in normalized coordinate space `[0, 1]`.
- **Primary Click / Tap:**
  - On Camera Selector: switches `activeCamera` (1..4).
  - On Reboot button: triggers system restart when in `finalReveal` or `systemFailure`.
  - On Flashlight toggle: toggles flashlight beam power (battery conserving / suspense).
- **Keyboard Shortcuts:**
  - `1`, `2`, `3`, `4`: Switch to CAM 1, 2, 3, or 4.
  - `F` or `Space`: Toggle flashlight beam.
  - `R`: Reboot system (when available).

### Mobile / Touch
- **Single Touch Drag:** Moves flashlight cone smoothly across the screen with slight easing to maintain tension.
- **HUD Buttons:** 44px+ touch targets positioned at bottom for CAM 1..4 switching.

## 2. Dynamic Interaction Behaviors

### Flashlight Cone Mechanics
- **Radius:** Defaults to 18% of screen width.
- **Penumbra:** Soft quadratic falloff from 100% illumination at center to 0% at edge.
- **Flicker:** When `entityDistance < 30`, flashlight intensity micro-flickers between 60% and 100% using high-frequency noise.
- **Entity Glare:** When beam directly intersects the entity's bounding volume, entity eyes reflect back a chilling specular glow.

### Camera Switch Sequence
1. User clicks or presses camera hotkey (e.g., CAM 03).
2. Audio produces momentary relay click and static squelch (60ms).
3. Scanlines burst, signal drops momentarily to 0%, then snaps to selected feed.
4. If entity is present on newly selected camera, a brief audio stinger triggers.

### Possessed UI Interaction (Beat 4 & 5)
- During `systemFailure`, UI buttons resist clicks, exhibit glitch displacement, and display corrupted glyphs (`ERR: OVERFLOW`, `SIGNAL CORRUPTED`).
- The mouse cursor exhibits slight rubber-band magnetic attraction toward the anomaly center before complete lockdown.

## 3. Accessibility & Fallback
- `prefers-reduced-motion`: When active, disables rapid screen flash/strobe effects and replaces violently shaking CRT distortion with subtle static overlays.
- Screen reader / ARIA status alerts: Live announcements (`aria-live="polite"`) broadcast major state shifts (e.g., "Motion detected on Camera 3", "System integrity critical").

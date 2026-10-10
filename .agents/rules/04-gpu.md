# GPU / WGSL
- Contest requires GPU Canvas. First confirm with `rive docs --search "gpu canvas"` where shaders must live. Prefer shaders INSIDE the Rive file so they count as GPU Canvas.
- Order: flashlight mask, fog, CRT, final distortion.
- Each shader documents inputs, uniforms, outputs, fallback, performance notes (header comment).
- Provide a graceful fallback and a lower-resolution mode for low-power devices.
- CONTEST OVERRIDE: flashlight and fog are REQUIRED shaders (scoring). CRT/distortion only if budget allows.

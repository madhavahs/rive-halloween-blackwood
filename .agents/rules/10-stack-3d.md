# 3D stack and languages
- Core: TypeScript (strict). Rive: RML + Luau. GPU: WGSL. UI: CSS. Tests: TypeScript. Docs/config: Markdown, JSON.
- 3D look: Path A first (WGSL pseudo-3D / raymarching inside Rive GPU Canvas). Path B (Three.js + glTF models from Blender) only if Path A fails; document why. Never replace Rive with Three.js.
- Before any 3D work, confirm via `rive docs --search "gpu canvas"` whether true 3D is supported. Do not assume.
- Python only for isolated asset tooling (e.g. Blender export), never in the core app.

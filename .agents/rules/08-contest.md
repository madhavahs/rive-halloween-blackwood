# Rive Halloween Challenge compliance (HARD RULES)
1. Theme: spooky / haunted. This project = haunted UI + creepy entity + ghostly game.
2. MUST use Rive CLI AND GPU Canvas. Combining with Scripting, Data Binding and State Machines scores higher: use ALL FIVE.
3. New work only. No third-party art/code/audio that is not original or properly licensed. Log every asset in docs/assets.md.
4. Human touch: finish and polish in the Rive Editor (timing, easing, silhouette, typography).
5. Judging (25): Concept and theme 10, CLI + GPU Canvas 10, Interactive motion design 5. Every milestone should visibly serve one of these.
6. Submission = Rive link or embedded URL (publish from the Editor; CLI --publish watermarks until bound to a Rive file) plus public post as the rules require. Re-read the Contra rules page before submitting; check the deadline there.
7. Maintain BUILD_LOG.md: each Rive CLI command used and why (evidence for the CLI score).
8. Required Rive usage map:
   - Data Binding: view model `Game` { systemState(enum), activeCamera, signalStrength, systemIntegrity, entityDistance, logLine(string), triggers: glitch, finalReveal }.
   - Scripting (Luau): entity behavior tick, log story lines, state progression rules.
   - State Machines: System, Entity, Camera, UI buttons (possessed hover).
   - GPU Canvas: flashlight + fog (+ CRT/distortion).

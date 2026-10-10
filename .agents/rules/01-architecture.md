# Architecture
- Keep responsibilities separated: React = lifecycle/input/accessibility/UI. Rive = animation + state machines. GPU = atmosphere.
- No giant React components. No game logic inside JSX.
- Explicit interfaces at system boundaries (RiveController, GameState).
- Rendering, state, input and orchestration must be independently testable.

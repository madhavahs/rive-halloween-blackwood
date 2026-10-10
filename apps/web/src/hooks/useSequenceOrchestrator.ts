import { useEffect, useRef } from "react";
import { ExtendedGameState, GameAction } from "../game/gameState";
import { RiveController } from "../game/types";
import {
  evaluateNextTimelineState,
  calculatePacingMultiplier,
} from "../game/sequenceOrchestrator";

interface UseSequenceOrchestratorOptions {
  state: ExtendedGameState;
  dispatch: React.Dispatch<GameAction>;
  controller: RiveController | null;
  autoPlayEnabled?: boolean;
}

export function useSequenceOrchestrator({
  state,
  dispatch,
  controller,
  autoPlayEnabled = true,
}: UseSequenceOrchestratorOptions) {
  const elapsedSecondsRef = useRef(0);
  const lastStateRef = useRef(state.systemState);

  // Reset clock on reboot
  useEffect(() => {
    if (state.systemState === "normal" && lastStateRef.current === "finalReveal") {
      elapsedSecondsRef.current = 0;
    }
    lastStateRef.current = state.systemState;
  }, [state.systemState]);

  useEffect(() => {
    if (!autoPlayEnabled) return;
    if (state.systemState === "finalReveal") return;

    const interval = setInterval(() => {
      const delta = 0.5;
      const multiplier = calculatePacingMultiplier(state);
      elapsedSecondsRef.current += delta * multiplier;

      dispatch({ type: "TICK", deltaSeconds: delta * multiplier });

      const nextEvent = evaluateNextTimelineState(
        elapsedSecondsRef.current,
        state.systemState
      );

      if (nextEvent) {
        dispatch({ type: "SET_SYSTEM_STATE", state: nextEvent.targetState });

        // Trigger Rive animations
        if (nextEvent.targetState === "cameraGlitch") {
          controller?.triggerGlitch();
        } else if (nextEvent.targetState === "finalReveal") {
          controller?.triggerFinalReveal();
        }

        if (nextEvent.autoCameraSwitch) {
          dispatch({ type: "SWITCH_CAMERA", camera: nextEvent.autoCameraSwitch });
          controller?.setActiveCamera(nextEvent.autoCameraSwitch);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [state, dispatch, controller, autoPlayEnabled]);

  return {
    elapsedSeconds: elapsedSecondsRef.current,
  };
}

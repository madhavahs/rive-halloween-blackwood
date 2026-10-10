import { useEffect, useRef, useState, useCallback } from "react";
import { Rive, Layout, Fit, Alignment, StateMachineInput } from "@rive-app/canvas";
import { SystemState, RiveController } from "../game/types";

export interface UseRiveControllerResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  controller: RiveController | null;
  isLoaded: boolean;
  error: string | null;
}

const STATE_INDEX_MAP: Record<SystemState, number> = {
  boot: 0,
  normal: 1,
  motionDetected: 2,
  cameraGlitch: 3,
  entityVisible: 4,
  entityTracking: 5,
  systemFailure: 6,
  finalReveal: 7,
};

export function useRiveController(src = "/rive/blackwood.riv"): UseRiveControllerResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const riveRef = useRef<Rive | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cached state machine inputs
  const inputsRef = useRef<{
    stateIndex?: StateMachineInput;
    activeCamera?: StateMachineInput;
    entityDistance?: StateMachineInput;
    glitch?: StateMachineInput;
    reveal?: StateMachineInput;
  }>({});

  const setSystemState = useCallback((state: SystemState) => {
    const input = inputsRef.current.stateIndex;
    if (input) {
      input.value = STATE_INDEX_MAP[state];
    }
  }, []);

  const setActiveCamera = useCallback((camera: number) => {
    const input = inputsRef.current.activeCamera;
    if (input) {
      input.value = camera;
    }
  }, []);

  const setSignalStrength = useCallback((value: number) => {
    void value;
  }, []);

  const setEntityDistance = useCallback((value: number) => {
    const input = inputsRef.current.entityDistance;
    if (input) {
      input.value = value;
    }
  }, []);

  const triggerGlitch = useCallback(() => {
    const trigger = inputsRef.current.glitch;
    if (trigger) {
      trigger.fire();
    }
  }, []);

  const triggerFinalReveal = useCallback(() => {
    const trigger = inputsRef.current.reveal;
    if (trigger) {
      trigger.fire();
    }
  }, []);

  const boot = useCallback(() => {
    setSystemState("boot");
  }, [setSystemState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isCancelled = false;

    try {
      const riveInstance = new Rive({
        src,
        canvas,
        autoplay: true,
        stateMachines: "System",
        layout: new Layout({
          fit: Fit.Contain,
          alignment: Alignment.Center,
        }),
        onLoad: () => {
          if (isCancelled) return;
          riveRef.current = riveInstance;

          // Cache state machine inputs
          const inputs = riveInstance.stateMachineInputs("System");
          if (inputs) {
            inputs.forEach((input) => {
              if (input.name === "stateIndex") inputsRef.current.stateIndex = input;
              if (input.name === "activeCamera") inputsRef.current.activeCamera = input;
              if (input.name === "entityDistance") inputsRef.current.entityDistance = input;
              if (input.name === "glitch") inputsRef.current.glitch = input;
              if (input.name === "reveal") inputsRef.current.reveal = input;
            });
          }

          riveInstance.resizeDrawingSurfaceToCanvas();
          setIsLoaded(true);
        },
        onLoadError: (err) => {
          if (isCancelled) return;
          setError(typeof err === "string" ? err : "Failed to load Rive file");
        },
      });

      const handleResize = () => {
        if (riveRef.current) {
          riveRef.current.resizeDrawingSurfaceToCanvas();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        isCancelled = true;
        window.removeEventListener("resize", handleResize);
        riveInstance.cleanup();
        riveRef.current = null;
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown Rive error");
    }
  }, [src]);

  const controller: RiveController = {
    boot,
    setSystemState,
    setActiveCamera,
    setSignalStrength,
    setEntityDistance,
    triggerGlitch,
    triggerFinalReveal,
  };

  return {
    canvasRef,
    controller: isLoaded ? controller : null,
    isLoaded,
    error,
  };
}

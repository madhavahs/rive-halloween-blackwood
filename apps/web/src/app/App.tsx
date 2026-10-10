import { useReducer, useEffect, useCallback, useRef } from "react";
import { useRiveController } from "../rive/useRiveController";
import { RiveCanvas } from "../rive/RiveCanvas";
import { HalloweenRoomCanvas } from "../components/HalloweenRoomCanvas";
import { Haunted3DExperience } from "../components/Haunted3DExperience";
import { FlashlightOverlay } from "../components/FlashlightOverlay";
import { ShaderCanvas } from "../shaders/ShaderCanvas";
import { TerminalOverlay } from "../components/TerminalOverlay";
import { gameReducer, createInitialGameState } from "../game/gameState";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useSequenceOrchestrator } from "../hooks/useSequenceOrchestrator";
import { soundEngine } from "../audio/SoundEngine";

export function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const { canvasRef, controller, isLoaded, error } = useRiveController();
  const prevStateRef = useRef(state.systemState);
  const prevIlluminatedRef = useRef(false);

  const handleCameraChange = useCallback(
    (cam: number) => {
      controller?.setActiveCamera(cam);
    },
    [controller]
  );

  // Enable keyboard shortcuts (1-4 for cameras, Space/F for flashlight, R for reboot, M for mute, Tab for dossier)
  useKeyboardShortcuts({
    dispatch,
    systemState: state.systemState,
    activeTab: state.activeTab,
    onCameraChange: handleCameraChange,
  });

  // Automated narrative sequence orchestrator
  useSequenceOrchestrator({
    state,
    dispatch,
    controller,
    autoPlayEnabled: true,
  });

  // Unlock audio on first user gesture anywhere on screen
  useEffect(() => {
    const handleFirstGesture = () => {
      soundEngine.unlock();
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };

    window.addEventListener("pointerdown", handleFirstGesture);
    window.addEventListener("keydown", handleFirstGesture);
    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, []);

  // Synchronize state with SoundEngine (ambient tension and one-shot cues)
  useEffect(() => {
    // 1. Calculate continuous tension level (0.0 to 1.0)
    let tension = 0.1;
    switch (state.systemState) {
      case "normal":
        tension = 0.1;
        break;
      case "motionDetected":
        tension = 0.35;
        break;
      case "cameraGlitch":
        tension = 0.55;
        break;
      case "entityVisible":
        tension = 0.75;
        break;
      case "entityTracking":
        tension = 0.85 + ((100 - state.entityDistance) / 100) * 0.15;
        break;
      case "systemFailure":
        tension = 0.95;
        break;
      case "finalReveal":
        tension = 1.0;
        break;
    }
    soundEngine.setTension(tension);

    // 2. Trigger audio cues upon transition into new states
    if (prevStateRef.current !== state.systemState) {
      if (state.systemState === "cameraGlitch") {
        soundEngine.playGlitchStatic(0.35, 0.45);
      } else if (state.systemState === "systemFailure") {
        soundEngine.playGlitchStatic(0.65, 0.65);
      } else if (state.systemState === "finalReveal") {
        soundEngine.playFinalRevealStinger();
      }
      prevStateRef.current = state.systemState;
    }
  }, [state.systemState, state.entityDistance]);

  // Periodic heartbeat sound based on panic level
  useEffect(() => {
    if (state.panicLevel < 35 || state.isAudioMuted) return;

    const intervalMs = Math.max(380, 1100 - (state.panicLevel / 100) * 720);
    const interval = setInterval(() => {
      soundEngine.playHeartbeat(Math.min(0.85, 0.25 + (state.panicLevel / 100) * 0.6));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [state.panicLevel, state.isAudioMuted]);

  // Monster illumination reaction sound
  useEffect(() => {
    if (!prevIlluminatedRef.current && state.isEntityIlluminated && !state.isAudioMuted) {
      if (state.activeCamera === 4 || state.activeCamera === 3) {
        soundEngine.playDemonGrowl();
      } else {
        soundEngine.playWhisper();
      }
    }
    prevIlluminatedRef.current = state.isEntityIlluminated;
  }, [state.isEntityIlluminated, state.activeCamera, state.isAudioMuted]);

  // Sync mute state with SoundEngine
  useEffect(() => {
    soundEngine.setMuted(state.isAudioMuted);
  }, [state.isAudioMuted]);

  // Sync state changes with RiveController
  useEffect(() => {
    if (!controller) return;
    controller.setSystemState(state.systemState);
    controller.setActiveCamera(state.activeCamera);
    controller.setSignalStrength(state.signalStrength);
    controller.setEntityDistance(state.entityDistance);
  }, [controller, state.systemState, state.activeCamera, state.signalStrength, state.entityDistance]);

  const handleFlashlightMove = (pos: { x: number; y: number }) => {
    dispatch({ type: "UPDATE_FLASHLIGHT", position: pos });
  };

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: state.systemState === "finalReveal" ? "#0c0205" : "#050308",
        overflow: "hidden",
        transition: "background-color 0.8s ease-in-out",
      }}
    >
      {/* 1. Underlying Rive Surveillance Scene */}
      <RiveCanvas
        canvasRef={canvasRef}
        isLoaded={isLoaded}
        error={error}
      />

      {/* 2. Interactive Halloween Room Environments & Animated Monsters */}
      <HalloweenRoomCanvas
        activeCamera={state.activeCamera}
        systemState={state.systemState}
        entityDistance={state.entityDistance}
        flashlightPosition={state.flashlightPosition}
        flashlightOn={state.flashlightOn}
        onEntityIlluminated={(illuminated) => {
          dispatch({ type: "SET_ENTITY_ILLUMINATED", illuminated });
        }}
      />

      {/* 3. Darkness Mask & Interactive Flashlight Beam */}
      <FlashlightOverlay
        position={state.flashlightPosition}
        isOn={state.flashlightOn}
        entityDistance={state.entityDistance}
        onPositionChange={handleFlashlightMove}
      />

      {/* 4. GPU Atmospheric Effects (Fog, CRT Scanlines, Chromatic Glitch) */}
      <ShaderCanvas
        systemState={state.systemState}
        flashlightPosition={state.flashlightPosition}
      />

      {/* 5. Survival Horror Panic Vignette Border */}
      {state.panicLevel > 10 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow: `inset 0 0 ${Math.min(180, state.panicLevel * 1.8)}px rgba(255, 20, 50, ${Math.min(0.7, state.panicLevel / 130)})`,
            transition: "box-shadow 0.2s ease-out",
            zIndex: 8,
          }}
        />
      )}

      {/* 6. Top-Level Surveillance HUD & Controls */}
      <TerminalOverlay
        controller={controller}
        state={state}
        dispatch={dispatch}
      />

      {/* 7. Real-time 3D Haunted Corridor & Ghost Whisper Investigation Mode */}
      {state.activeTab === "spectral3d" && (
        <Haunted3DExperience
          onExit={() => dispatch({ type: "SET_ACTIVE_TAB", tab: "surveillance" })}
          isAudioMuted={state.isAudioMuted}
        />
      )}
    </main>
  );
}

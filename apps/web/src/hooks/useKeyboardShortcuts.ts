import { useEffect } from "react";
import { GameAction } from "../game/gameState";
import { SystemState } from "../game/types";
import { soundEngine } from "../audio/SoundEngine";

interface UseKeyboardShortcutsOptions {
  dispatch: React.Dispatch<GameAction>;
  systemState: SystemState;
  activeTab?: "surveillance" | "dossier";
  onCameraChange?: (cam: number) => void;
  onToggleMute?: () => void;
}

export function useKeyboardShortcuts({
  dispatch,
  systemState,
  activeTab = "surveillance",
  onCameraChange,
  onToggleMute,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inputs if user is typing in an input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Unlock audio on any intentional keypress
      soundEngine.unlock();

      const key = e.key.toLowerCase();

      // Number keys 1-4 for camera selection
      if (["1", "2", "3", "4"].includes(key)) {
        if (systemState !== "systemFailure" && systemState !== "finalReveal") {
          const cam = parseInt(key, 10);
          dispatch({ type: "SWITCH_CAMERA", camera: cam });
          soundEngine.playCameraSwitch();
          onCameraChange?.(cam);
        }
      }

      // Flashlight toggle: 'f' or ' ' (Space)
      if (key === "f" || key === " ") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_FLASHLIGHT" });
        soundEngine.playFlashlightClick();
      }

      // Toggle audio mute: 'm'
      if (key === "m") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_AUDIO" });
        onToggleMute?.();
      }

      // Tab key: Toggle between surveillance feeds and monster dossier
      if (e.key === "Tab") {
        e.preventDefault();
        const nextTab = activeTab === "dossier" ? "surveillance" : "dossier";
        dispatch({ type: "SET_ACTIVE_TAB", tab: nextTab });
        soundEngine.playCameraSwitch();
      }

      // Reboot terminal: 'r'
      if (key === "r") {
        if (systemState === "systemFailure" || systemState === "finalReveal") {
          e.preventDefault();
          dispatch({ type: "REBOOT" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, systemState, activeTab, onCameraChange, onToggleMute]);
}

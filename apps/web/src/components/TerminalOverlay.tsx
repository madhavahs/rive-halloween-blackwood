import React from "react";
import { ExtendedGameState, GameAction } from "../game/gameState";
import { RiveController } from "../game/types";
import { soundEngine } from "../audio/SoundEngine";

interface TerminalOverlayProps {
  controller: RiveController | null;
  state: ExtendedGameState;
  dispatch: React.Dispatch<GameAction>;
}

export const TerminalOverlay: React.FC<TerminalOverlayProps> = ({
  controller,
  state,
  dispatch,
}) => {
  const cameraLabels = ["FOYER", "WEST HALL", "ARCHIVUM", "MASTER BED"];

  const handleCameraClick = (cam: number) => {
    soundEngine.unlock();
    soundEngine.playCameraSwitch();
    dispatch({ type: "SWITCH_CAMERA", camera: cam });
    controller?.setActiveCamera(cam);
  };

  const handleToggleLight = () => {
    soundEngine.unlock();
    soundEngine.playFlashlightClick();
    dispatch({ type: "TOGGLE_FLASHLIGHT" });
  };

  const handleToggleAudio = () => {
    soundEngine.unlock();
    dispatch({ type: "TOGGLE_AUDIO" });
  };

  const handleAdvance = () => {
    soundEngine.unlock();
    dispatch({ type: "ADVANCE_STATE" });
    if (state.systemState === "normal") {
      controller?.setSystemState("motionDetected");
    } else if (state.systemState === "motionDetected") {
      controller?.triggerGlitch();
      controller?.setSystemState("cameraGlitch");
    } else if (state.systemState === "systemFailure") {
      controller?.triggerFinalReveal();
      controller?.setSystemState("finalReveal");
    }
  };

  const handleReboot = () => {
    soundEngine.unlock();
    dispatch({ type: "REBOOT" });
    controller?.boot();
  };

  const handleToggleDossier = (tab: "surveillance" | "dossier") => {
    soundEngine.unlock();
    soundEngine.playCameraSwitch();
    dispatch({ type: "SET_ACTIVE_TAB", tab });
  };

  const isLocked = state.systemState === "systemFailure" || state.systemState === "finalReveal";

  // Battery bar calculations
  const batteryPct = Math.max(0, Math.min(100, Math.round(state.batteryLevel)));
  const batterySegments = Math.round(batteryPct / 10);
  const batteryBar = "█".repeat(batterySegments) + "░".repeat(10 - batterySegments);
  const batteryColor = batteryPct > 50 ? "#33ff77" : batteryPct > 20 ? "#ffaa33" : "#ff2a4b";

  // Panic bar calculations
  const panicPct = Math.max(0, Math.min(100, Math.round(state.panicLevel)));
  const panicSegments = Math.round(panicPct / 10);
  const panicBar = "█".repeat(panicSegments) + "░".repeat(10 - panicSegments);
  const panicColor = panicPct > 70 ? "#ff2a4b" : panicPct > 35 ? "#ffaa33" : "#33ff77";

  return (
    <div
      role="region"
      aria-label="Surveillance Terminal Interface"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        fontFamily: "ui-monospace, 'SF Mono', 'Courier New', monospace",
        color: state.systemState === "finalReveal" ? "#ff2a4b" : "#33ff77",
        textShadow: state.systemState === "finalReveal" 
          ? "0 0 6px rgba(255, 42, 75, 0.8)" 
          : "0 0 4px rgba(51, 255, 119, 0.4)",
        zIndex: 10,
        boxSizing: "border-box",
      }}
    >
      {/* TOP HEADER & TELEMETRY */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div
          role="status"
          aria-label="Surveillance system telemetry"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(51, 255, 119, 0.2)",
            paddingBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <span style={{ color: "#ff2a4b", fontWeight: "bold" }}>● REC</span>
            <span>BLACKWOOD SURVEILLANCE OS v4.1</span>
            <span>CAM 0{state.activeCamera} // {cameraLabels[state.activeCamera - 1] ?? "FEED"}</span>
          </div>
          <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
            <span>SIGNAL: {state.signalStrength}%</span>
            <span>INTEGRITY: {state.systemIntegrity}%</span>
            <span>STATE: {state.systemState.toUpperCase()}</span>
          </div>
        </div>

        {/* SUB-HEADER: SURVIVAL GAUGES & VIEW MODE TABS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            backgroundColor: "rgba(5, 3, 8, 0.75)",
            padding: "4px 8px",
            border: "1px solid rgba(51, 255, 119, 0.2)",
            pointerEvents: "auto",
          }}
        >
          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleToggleDossier("surveillance")}
              style={{
                backgroundColor: state.activeTab === "surveillance" ? "rgba(51, 255, 119, 0.25)" : "transparent",
                color: state.activeTab === "surveillance" ? "#33ff77" : "#888",
                border: `1px solid ${state.activeTab === "surveillance" ? "#33ff77" : "rgba(255, 255, 255, 0.15)"}`,
                padding: "2px 8px",
                fontFamily: "monospace",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              [1] CAMERAS
            </button>
            <button
              onClick={() => handleToggleDossier("dossier")}
              style={{
                backgroundColor: state.activeTab === "dossier" ? "rgba(255, 170, 51, 0.25)" : "transparent",
                color: state.activeTab === "dossier" ? "#ffaa33" : "#888",
                border: `1px solid ${state.activeTab === "dossier" ? "#ffaa33" : "rgba(255, 255, 255, 0.15)"}`,
                padding: "2px 8px",
                fontFamily: "monospace",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              [TAB] 🎃 MONSTER DOSSIER
            </button>
          </div>

          {/* Survival Gauges */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ color: batteryColor }}>
              ⚡ BATTERY: [{batteryBar}] {batteryPct}%
            </div>
            <div style={{ color: panicColor }}>
              ♥ PANIC: [{panicBar}] {panicPct}%
            </div>
            {state.isEntityIlluminated && (
              <span style={{ color: "#ff2a4b", fontWeight: "bold", animation: "pulse 1s infinite" }}>
                [⚠ ENTITY ILLUMINATED]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TACTICAL ESTATE MINIMAP (SURVEILLANCE MODE) */}
      {state.activeTab === "surveillance" && (
        <div
          style={{
            position: "absolute",
            top: "85px",
            right: "20px",
            width: "190px",
            backgroundColor: "rgba(6, 4, 10, 0.85)",
            border: "1px solid rgba(51, 255, 119, 0.3)",
            padding: "8px",
            fontSize: "11px",
            pointerEvents: "auto",
            zIndex: 11,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(51, 255, 119, 0.2)",
              paddingBottom: "4px",
              marginBottom: "6px",
              fontSize: "10px",
              fontWeight: "bold",
              color: "#33ff77",
            }}
          >
            <span>ESTATE RADAR</span>
            <span>PROX: {state.entityDistance}m</span>
          </div>

          {/* 4-Sector Blueprint Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px",
            }}
          >
            {[
              { id: 1, name: "FOYER" },
              { id: 2, name: "W. HALL" },
              { id: 3, name: "ARCHIVUM" },
              { id: 4, name: "M. BED" },
            ].map((room) => {
              const isCurrent = state.activeCamera === room.id;
              const hasAnomaly = state.entityCamera === room.id;
              return (
                <button
                  key={room.id}
                  disabled={isLocked}
                  onClick={() => handleCameraClick(room.id)}
                  style={{
                    backgroundColor: isCurrent
                      ? "rgba(51, 255, 119, 0.25)"
                      : hasAnomaly
                      ? "rgba(255, 42, 75, 0.15)"
                      : "rgba(10, 15, 20, 0.6)",
                    border: isCurrent
                      ? "1px solid #33ff77"
                      : hasAnomaly
                      ? "1px dashed #ff2a4b"
                      : "1px solid rgba(51, 255, 119, 0.15)",
                    padding: "6px 4px",
                    color: isCurrent ? "#33ff77" : hasAnomaly ? "#ff5577" : "#88aa99",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>CAM 0{room.id}</div>
                  <div style={{ fontSize: "9px", opacity: 0.8 }}>{room.name}</div>
                  {hasAnomaly && (
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#ff2a4b",
                        boxShadow: "0 0 4px #ff2a4b",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "6px",
              paddingTop: "4px",
              borderTop: "1px solid rgba(51, 255, 119, 0.15)",
              fontSize: "9px",
              color: state.entityCamera === state.activeCamera ? "#ff4466" : "#779988",
              textAlign: "center",
            }}
          >
            {state.entityCamera === state.activeCamera
              ? "⚠ ENTITY ON CURRENT FEED!"
              : `RADAR: CAM 0${state.entityCamera} PULSING`}
          </div>
        </div>
      )}

      {/* MONSTER DOSSIER OVERLAY (WHEN TAB ACTIVE) */}
      {state.activeTab === "dossier" && (
        <div
          style={{
            position: "absolute",
            inset: "70px 20px 80px 20px",
            backgroundColor: "rgba(5, 3, 9, 0.94)",
            border: "2px solid #ffaa33",
            boxShadow: "0 0 20px rgba(255, 170, 51, 0.25)",
            padding: "20px",
            overflowY: "auto",
            pointerEvents: "auto",
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 170, 51, 0.4)",
              paddingBottom: "8px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#ffaa33" }}>
                🎃 CLASSIFIED OCCULT BESTIARY // BLACKWOOD MANOR
              </h2>
              <div style={{ fontSize: "11px", color: "#bbb" }}>
                Surveillance Intelligence Dossier — All Hallows' Eve Paranormal Anomalies
              </div>
            </div>
            <button
              onClick={() => handleToggleDossier("surveillance")}
              style={{
                backgroundColor: "rgba(255, 170, 51, 0.2)",
                color: "#ffaa33",
                border: "1px solid #ffaa33",
                padding: "6px 12px",
                fontFamily: "monospace",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✕ CLOSE DOSSIER [TAB]
            </button>
          </div>

          {/* 4 Monster Bestiary Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {/* Monster 1 */}
            <div
              style={{
                border: "1px solid rgba(255, 170, 51, 0.3)",
                backgroundColor: "rgba(20, 15, 25, 0.7)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#ffaa33", fontWeight: "bold" }}>CAM 01 // GRAND FOYER</span>
                <span style={{ color: "#ff5555", fontSize: "11px" }}>THREAT: HIGH</span>
              </div>
              <h3 style={{ margin: "2px 0", color: "#ffe5b4", fontSize: "15px" }}>
                THE BURLAP SCARECROW
              </h3>
              <div style={{ fontSize: "11px", color: "#bbb", lineHeight: "1.4" }}>
                Stitched hessian construct bound by rusted thorns. Perches along the grand staircase
                bannister. Its twitching hollow head blinks glowing amber eyes into the darkness.
              </div>
              <div style={{ fontSize: "10px", color: "#33ff77" }}>
                TACTIC: Sweep flashlight beam to break its stalking fixation.
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button
                  onClick={() => soundEngine.playWhisper()}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid #ffaa33",
                    color: "#ffaa33",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  🔊 AUDIO PREVIEW
                </button>
                <button
                  onClick={() => {
                    handleCameraClick(1);
                    handleToggleDossier("surveillance");
                  }}
                  style={{
                    backgroundColor: "rgba(51, 255, 119, 0.15)",
                    border: "1px solid #33ff77",
                    color: "#33ff77",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  📹 JUMP TO FEED
                </button>
              </div>
            </div>

            {/* Monster 2 */}
            <div
              style={{
                border: "1px solid rgba(100, 200, 255, 0.3)",
                backgroundColor: "rgba(10, 20, 30, 0.7)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#66ccff", fontWeight: "bold" }}>CAM 02 // WEST HALL</span>
                <span style={{ color: "#ff5555", fontSize: "11px" }}>THREAT: EXTREME</span>
              </div>
              <h3 style={{ margin: "2px 0", color: "#d0eeff", fontSize: "15px" }}>
                THE SPECTRAL BRIDE
              </h3>
              <div style={{ fontSize: "11px", color: "#bbb", lineHeight: "1.4" }}>
                Ethereal wraith in torn mourning lace drifting inches above the corridor floorboards.
                Her mournful ectoplasmic tears dissolve surveillance optical sensors.
              </div>
              <div style={{ fontSize: "10px", color: "#66ccff" }}>
                TACTIC: Direct illumination causes temporary phase dispersal.
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button
                  onClick={() => soundEngine.playWhisper()}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid #66ccff",
                    color: "#66ccff",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  🔊 AUDIO PREVIEW
                </button>
                <button
                  onClick={() => {
                    handleCameraClick(2);
                    handleToggleDossier("surveillance");
                  }}
                  style={{
                    backgroundColor: "rgba(51, 255, 119, 0.15)",
                    border: "1px solid #33ff77",
                    color: "#33ff77",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  📹 JUMP TO FEED
                </button>
              </div>
            </div>

            {/* Monster 3 */}
            <div
              style={{
                border: "1px solid rgba(255, 120, 50, 0.3)",
                backgroundColor: "rgba(30, 15, 10, 0.7)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#ff8833", fontWeight: "bold" }}>CAM 03 // ARCHIVUM</span>
                <span style={{ color: "#ff3333", fontSize: "11px" }}>THREAT: SEVERE</span>
              </div>
              <h3 style={{ margin: "2px 0", color: "#ffc080", fontSize: "15px" }}>
                THE PUMPKIN STALKER
              </h3>
              <div style={{ fontSize: "11px", color: "#bbb", lineHeight: "1.4" }}>
                Fiery Jack-o'-Lantern demon lurking behind ancient occult tomes. Cracking glowing embers
                radiate from its jagged fangs while thorny vines creep across bookshelf ladders.
              </div>
              <div style={{ fontSize: "10px", color: "#ff8833" }}>
                TACTIC: Flashlight causes its ember core to flare; monitor panic.
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button
                  onClick={() => soundEngine.playDemonGrowl()}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid #ff8833",
                    color: "#ff8833",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  🔊 AUDIO PREVIEW
                </button>
                <button
                  onClick={() => {
                    handleCameraClick(3);
                    handleToggleDossier("surveillance");
                  }}
                  style={{
                    backgroundColor: "rgba(51, 255, 119, 0.15)",
                    border: "1px solid #33ff77",
                    color: "#33ff77",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  📹 JUMP TO FEED
                </button>
              </div>
            </div>

            {/* Monster 4 */}
            <div
              style={{
                border: "1px solid rgba(255, 40, 70, 0.4)",
                backgroundColor: "rgba(35, 5, 15, 0.75)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#ff2a4b", fontWeight: "bold" }}>CAM 04 // MASTER BED</span>
                <span style={{ color: "#ff0000", fontSize: "11px", fontWeight: "bold" }}>
                  THREAT: CATACLYSMIC
                </span>
              </div>
              <h3 style={{ margin: "2px 0", color: "#ff7788", fontSize: "15px" }}>
                THE CRIMSON VOID DEMON
              </h3>
              <div style={{ fontSize: "11px", color: "#bbb", lineHeight: "1.4" }}>
                Apex nightmare entity lurking behind the velvet bed drapery. Features curled demonic ram
                horns, four blazing ruby eyes, obsidian wings, and a razor-toothed abyssal maw.
              </div>
              <div style={{ fontSize: "10px", color: "#ff2a4b" }}>
                TACTIC: Imminent system compromise. Conserve battery and maintain distance.
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button
                  onClick={() => soundEngine.playDemonGrowl()}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid #ff2a4b",
                    color: "#ff2a4b",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  🔊 AUDIO PREVIEW
                </button>
                <button
                  onClick={() => {
                    handleCameraClick(4);
                    handleToggleDossier("surveillance");
                  }}
                  style={{
                    backgroundColor: "rgba(51, 255, 119, 0.15)",
                    border: "1px solid #33ff77",
                    color: "#33ff77",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  📹 JUMP TO FEED
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIMAX ALERT BANNER */}
      {state.systemState === "finalReveal" && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            alignSelf: "center",
            backgroundColor: "rgba(255, 42, 75, 0.15)",
            border: "2px solid #ff2a4b",
            padding: "16px 32px",
            fontSize: "20px",
            letterSpacing: "0.2em",
            fontWeight: "bold",
            textAlign: "center",
            zIndex: 12,
          }}
        >
          [ CONNECTION SEVERED — ENTITY IN PROXIMITY ]
        </div>
      )}

      {/* BOTTOM CONTROLS & LOGS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "1px solid rgba(51, 255, 119, 0.2)",
          paddingTop: "12px",
          pointerEvents: "auto",
        }}
      >
        {/* Terminal Logs (Bottom Left) */}
        <div
          role="log"
          aria-live="polite"
          aria-label="System event logs"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "12px",
            maxWidth: "480px",
            backgroundColor: "rgba(5, 3, 8, 0.7)",
            padding: "8px 12px",
            borderLeft: "2px solid #33ff77",
          }}
        >
          {state.logs.map((log, idx) => (
            <div key={idx} style={{ opacity: 0.6 + idx * 0.1 }}>
              {log}
            </div>
          ))}
        </div>

        {/* Right Controls */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
          {/* Camera Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4].map((cam) => (
              <button
                key={cam}
                aria-label={`Camera 0${cam} ${cameraLabels[cam - 1] ?? "Feed"}`}
                disabled={isLocked}
                onClick={() => handleCameraClick(cam)}
                style={{
                  backgroundColor: state.activeCamera === cam ? "#33ff77" : "rgba(10, 20, 15, 0.8)",
                  color: state.activeCamera === cam ? "#050308" : "#33ff77",
                  border: "1px solid #33ff77",
                  padding: "6px 14px",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  opacity: isLocked ? 0.4 : 1,
                }}
              >
                CAM 0{cam}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              aria-label={`Flashlight ${state.flashlightOn ? "on" : "off"}. Press F to toggle.`}
              onClick={handleToggleLight}
              style={{
                backgroundColor: state.flashlightOn ? "rgba(255, 248, 231, 0.2)" : "rgba(10, 10, 10, 0.6)",
                color: state.flashlightOn ? "#fff8e7" : "#666",
                border: `1px solid ${state.flashlightOn ? "#fff8e7" : "#444"}`,
                padding: "6px 14px",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              LIGHT: {state.flashlightOn ? "ON" : "OFF"} [F]
            </button>

            <button
              aria-label={`Audio effects ${!state.isAudioMuted ? "enabled" : "muted"}. Press M to toggle.`}
              onClick={handleToggleAudio}
              style={{
                backgroundColor: !state.isAudioMuted ? "rgba(51, 255, 119, 0.15)" : "rgba(40, 40, 40, 0.6)",
                color: !state.isAudioMuted ? "#33ff77" : "#888",
                border: `1px solid ${!state.isAudioMuted ? "#33ff77" : "#555"}`,
                padding: "6px 14px",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              AUDIO: {!state.isAudioMuted ? "ON" : "MUTED"} [M]
            </button>

            <button
              aria-label="Advance story beat"
              onClick={handleAdvance}
              disabled={state.systemState === "finalReveal"}
              style={{
                backgroundColor: "rgba(51, 255, 119, 0.15)",
                color: "#33ff77",
                border: "1px solid #33ff77",
                padding: "6px 14px",
                fontFamily: "monospace",
                cursor: state.systemState === "finalReveal" ? "not-allowed" : "pointer",
                opacity: state.systemState === "finalReveal" ? 0.3 : 1,
              }}
            >
              ADVANCE BEAT
            </button>

            {isLocked && (
              <button
                aria-label="Reboot surveillance terminal"
                onClick={handleReboot}
                style={{
                  backgroundColor: "rgba(255, 42, 75, 0.25)",
                  color: "#ff2a4b",
                  border: "1px solid #ff2a4b",
                  padding: "6px 14px",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                REBOOT TERMINAL
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

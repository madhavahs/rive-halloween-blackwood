import React from "react";

interface RiveCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoaded: boolean;
  error: string | null;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const RiveCanvas: React.FC<RiveCanvasProps> = ({
  canvasRef,
  isLoaded,
  error,
  onPointerMove,
}) => {
  return (
    <div
      onPointerMove={onPointerMove}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#050308",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: isLoaded ? "block" : "none",
          objectFit: "contain",
        }}
      />

      {!isLoaded && !error && (
        <div
          style={{
            color: "#33ff77",
            fontFamily: "monospace",
            fontSize: "14px",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          [ INITIALIZING SURVEILLANCE FEED... ]
        </div>
      )}

      {error && (
        <div
          style={{
            color: "#ff2a4b",
            fontFamily: "monospace",
            fontSize: "14px",
            textAlign: "center",
            padding: "20px",
            border: "1px solid #ff2a4b",
          }}
        >
          FEED CONNECTION ERROR: {error}
        </div>
      )}
    </div>
  );
};

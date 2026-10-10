import React, { useEffect, useRef, useCallback } from "react";

interface FlashlightOverlayProps {
  position: { x: number; y: number };
  isOn: boolean;
  entityDistance: number;
  onPositionChange: (pos: { x: number; y: number }) => void;
}

export function calculateFlashlightFlicker(timeMs: number, entityDistance: number): number {
  if (entityDistance >= 30) return 1.0;
  // Intensity drops and micro-flickers when entity is close
  const proximityFactor = (30 - entityDistance) / 30; // 0..1
  const noise1 = Math.sin(timeMs * 0.045) * 0.15;
  const noise2 = Math.cos(timeMs * 0.083) * 0.15;
  const randomDrop = Math.random() < (proximityFactor * 0.08) ? 0.35 : 0;
  return Math.max(0.4, Math.min(1.0, 1.0 - (proximityFactor * 0.25) + noise1 + noise2 - randomDrop));
}

export function calculateBeamRadius(width: number): number {
  return Math.max(140, Math.min(280, width * 0.18));
}

export const FlashlightOverlay: React.FC<FlashlightOverlayProps> = ({
  position,
  isOn,
  entityDistance,
  onPositionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        onPositionChange({ x, y });
      }
    },
    [onPositionChange]
  );

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointer(e.clientX, e.clientY);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (touch) {
      handlePointer(touch.clientX, touch.clientY);
    }
  };

  // Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric shadow darkness
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5, 3, 8, 0.94)";
      ctx.fillRect(0, 0, width, height);

      if (isOn) {
        const flicker = calculateFlashlightFlicker(time, entityDistance);
        const radius = calculateBeamRadius(width);
        const cx = position.x * width;
        const cy = position.y * height;

        // Cut hole in darkness mask
        ctx.globalCompositeOperation = "destination-out";
        const maskGrad = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius);
        maskGrad.addColorStop(0, `rgba(0, 0, 0, ${flicker})`);
        maskGrad.addColorStop(0.65, `rgba(0, 0, 0, ${flicker * 0.85})`);
        maskGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = maskGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle warm glow highlight on lit area
        ctx.globalCompositeOperation = "source-over";
        const lightGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        lightGrad.addColorStop(0, `rgba(255, 248, 231, ${0.12 * flicker})`);
        lightGrad.addColorStop(0.7, `rgba(255, 248, 231, ${0.03 * flicker})`);
        lightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    const updateSize = () => {
      if (canvas && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener("resize", updateSize);
    };
  }, [position, isOn, entityDistance]);

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onTouchMove={onTouchMove}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "auto",
        cursor: isOn ? "crosshair" : "default",
        zIndex: 5,
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import { checkWebGPUSupport } from "./webgpuPipeline";
import { SystemState } from "../game/types";

interface ShaderCanvasProps {
  systemState: SystemState;
  flashlightPosition: { x: number; y: number };
}

export const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  systemState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasWebGPU, setHasWebGPU] = useState<boolean | null>(null);

  useEffect(() => {
    checkWebGPUSupport().then((supported) => {
      setHasWebGPU(supported);
    });
  }, []);

  // 2D Procedural Shader Fallback & Atmosphere Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    let animId: number;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (time: number) => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const seconds = prefersReducedMotion ? 0 : time * 0.001;

      // 1. Procedural Volumetric Fog (Eerie green-tinted mist)
      const fogDensity = systemState === "finalReveal" ? 0.6 : 0.25;
      const fogOffset = (seconds * 20) % width;

      ctx.save();
      ctx.globalAlpha = fogDensity;
      const fogGrad = ctx.createLinearGradient(0, 0, width, height);
      fogGrad.addColorStop(0, "rgba(20, 40, 28, 0.15)");
      fogGrad.addColorStop(0.5, "rgba(10, 25, 18, 0.25)");
      fogGrad.addColorStop(1, "rgba(5, 15, 10, 0.15)");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, width, height);

      // Drifting mist wave
      ctx.beginPath();
      ctx.moveTo(0, height * 0.6);
      for (let x = 0; x < width; x += 40) {
        const y = height * 0.6 + Math.sin((x + fogOffset) * 0.01) * 35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = "rgba(40, 75, 50, 0.12)";
      ctx.fill();
      ctx.restore();

      // 2. CRT Scanline Grid
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      ctx.restore();

      // 3. Chromatic Glitch Distortion (during glitch/failure/reveal)
      const isGlitch =
        systemState === "cameraGlitch" ||
        systemState === "systemFailure" ||
        systemState === "finalReveal";

      if (isGlitch) {
        const glitchIntensity = systemState === "finalReveal" ? 0.8 : 0.35;
        if (prefersReducedMotion) {
          // Static, non-flashing warning overlay for reduced motion users
          ctx.save();
          ctx.fillStyle = `rgba(255, 42, 75, ${glitchIntensity * 0.2})`;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        } else {
          const tearY = (Math.sin(seconds * 18) * 0.5 + 0.5) * height;
          const tearHeight = (24 + Math.random() * 40) * glitchIntensity;

          ctx.save();
          ctx.fillStyle = `rgba(255, 42, 75, ${glitchIntensity * 0.35})`;
          ctx.fillRect(0, tearY, width, tearHeight);

          // Chromatic offset slice
          ctx.fillStyle = `rgba(0, 200, 255, ${glitchIntensity * 0.25})`;
          ctx.fillRect(Math.sin(seconds * 30) * 15 * glitchIntensity, tearY + 4, width, tearHeight * 0.5);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      if (canvas && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [systemState]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 6, // Above flashlight mask, below HUD
        overflow: "hidden",
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
      {hasWebGPU && (
        <div
          style={{
            display: "none",
          }}
          data-testid="webgpu-status"
        >
          WebGPU Active
        </div>
      )}
    </div>
  );
};

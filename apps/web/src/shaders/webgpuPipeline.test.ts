import { describe, it, expect } from "vitest";
import {
  packFlashlightUniforms,
  packFogUniforms,
  packCrtUniforms,
  checkWebGPUSupport,
  ShaderUniforms,
} from "./webgpuPipeline";

describe("WebGPU pipeline & uniform packing", () => {
  const dummyUniforms: ShaderUniforms = {
    width: 1280,
    height: 800,
    cursorX: 0.5,
    cursorY: 0.5,
    timeSeconds: 12.5,
    fogDensity: 0.4,
    glitchStrength: 0.8,
    isCritical: true,
    scanlines: 0.5,
  };

  it("should pack flashlight uniforms into 8-float aligned buffer matching WGSL struct", () => {
    const buffer = packFlashlightUniforms(dummyUniforms);
    expect(buffer.length).toBe(8);
    expect(buffer[0]).toBe(1280);
    expect(buffer[1]).toBe(800);
    expect(buffer[2]).toBe(0.5);
    expect(buffer[3]).toBe(0.5);
    expect(buffer[6]).toBe(12.5); // time
  });

  it("should pack fog uniforms into float array", () => {
    const buffer = packFogUniforms(dummyUniforms);
    expect(buffer.length).toBe(6);
    expect(buffer[0]).toBe(1280);
    expect(buffer[1]).toBe(800);
    expect(buffer[2]).toBe(12.5);
    expect(buffer[3]).toBeCloseTo(0.4, 2); // density
  });

  it("should pack CRT uniforms correctly", () => {
    const buffer = packCrtUniforms(dummyUniforms);
    expect(buffer.length).toBe(8);
    expect(buffer[0]).toBe(1280);
    expect(buffer[3]).toBeCloseTo(0.04); // curvature
    expect(buffer[4]).toBe(0.5); // scanlines
  });

  it("should gracefully handle checkWebGPUSupport when navigator.gpu is undefined", async () => {
    const supported = await checkWebGPUSupport();
    expect(typeof supported).toBe("boolean");
  });
});

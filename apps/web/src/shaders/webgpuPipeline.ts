// WebGPU detection and pipeline manager for BLACKWOOD

export interface ShaderUniforms {
  width: number;
  height: number;
  cursorX: number;
  cursorY: number;
  timeSeconds: number;
  fogDensity: number;
  glitchStrength: number;
  isCritical: boolean;
  scanlines: number;
}

export async function checkWebGPUSupport(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return false;
  }
  try {
    const gpu = (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }).gpu;
    const adapter = await gpu.requestAdapter();
    return Boolean(adapter);
  } catch {
    return false;
  }
}

export function packFlashlightUniforms(u: ShaderUniforms): Float32Array {
  // Matches WGSL struct: resolution(2), cursor(2), radius(1), intensity(1), time(1), padding(1)
  const radius = Math.max(140, Math.min(280, u.width * 0.18));
  return new Float32Array([
    u.width,
    u.height,
    u.cursorX,
    u.cursorY,
    radius,
    1.0, // intensity
    u.timeSeconds,
    0.0, // padding
  ]);
}

export function packFogUniforms(u: ShaderUniforms): Float32Array {
  // Matches WGSL struct: resolution(2), time(1), density(1), speed(1), padding(1)
  return new Float32Array([
    u.width,
    u.height,
    u.timeSeconds,
    u.fogDensity,
    1.2, // speed
    0.0, // padding
  ]);
}

export function packCrtUniforms(u: ShaderUniforms): Float32Array {
  // Matches WGSL struct: resolution(2), time(1), curvature(1), scanlines(1), padding(3)
  return new Float32Array([
    u.width,
    u.height,
    u.timeSeconds,
    0.04, // curvature
    u.scanlines,
    0.0,
    0.0,
    0.0, // padding
  ]);
}

// ============================================================================
// BLACKWOOD SHADER PIPELINE: Flashlight & Darkness Mask
// ============================================================================
// Inputs:
//   - Vertex: Builtin vertex_index generating fullscreen quad [-1, 1]
//   - Uniforms:
//       resolution: vec2<f32>   // Canvas width and height in pixels
//       cursor:     vec2<f32>   // Normalized pointer coordinates [0..1]
//       radius:     f32         // Flashlight beam radius in pixels
//       intensity:  f32         // Flashlight brightness multiplier [0..1]
//       time:       f32         // Running timestamp in seconds
// Outputs:
//   - Fragment: vec4<f32> containing darkness mask and beam illumination
// Fallback:
//   - Canvas 2D radial gradient with ctx.globalCompositeOperation = 'destination-out'
// Performance Notes:
//   - Single pass, 0 texture lookups, purely arithmetic distance calculation.
//   - Highly optimized for mobile GPUs (minimal register pressure).
// ============================================================================

struct Uniforms {
    resolution: vec2<f32>,
    cursor:     vec2<f32>,
    radius:     f32,
    intensity:  f32,
    time:       f32,
    padding:    f32,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0,  1.0)
    );
    var uvs = array<vec2<f32>, 4>(
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 0.0)
    );

    var out: VertexOutput;
    out.position = vec4<f32>(pos[vertex_index], 0.0, 1.0);
    out.uv = uvs[vertex_index];
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let pixelCoord = in.uv * u.resolution;
    let lightCenter = u.cursor * u.resolution;
    let dist = distance(pixelCoord, lightCenter);

    // Quadratic smooth penumbra falloff
    let normDist = clamp(dist / max(u.radius, 1.0), 0.0, 1.0);
    let beamVisibility = (1.0 - smoothstep(0.15, 1.0, normDist)) * u.intensity;

    // Ambient room darkness (deep black-purple)
    let ambientDarkness = vec4<f32>(0.02, 0.012, 0.03, 0.94);

    // Warm tungsten light core
    let warmColor = vec4<f32>(1.0, 0.97, 0.91, 1.0);

    // Flashlight illuminates scene by cutting through darkness
    let finalAlpha = (1.0 - beamVisibility) * ambientDarkness.a;
    let glow = beamVisibility * 0.12;

    return vec4<f32>(
        ambientDarkness.rgb * (1.0 - beamVisibility) + warmColor.rgb * glow,
        finalAlpha
    );
}

// ============================================================================
// BLACKWOOD SHADER PIPELINE: CRT Monitor Post-Processing
// ============================================================================
// Inputs:
//   - Vertex: Builtin vertex_index generating fullscreen quad [-1, 1]
//   - Uniforms:
//       resolution: vec2<f32>   // Canvas width and height in pixels
//       time:       f32         // Running timestamp in seconds
//       curvature:  f32         // Barrel distortion factor (e.g. 0.05)
//       scanlines:  f32         // Scanline darkness strength [0..1]
// Outputs:
//   - Fragment: vec4<f32> simulated cathode ray tube phosphor effect
// Fallback:
//   - CSS repeating-linear-gradient scanline overlay and radial vignette
// Performance Notes:
//   - Simple trigonometric scanline calculation with minimal ALU cycles.
// ============================================================================

struct Uniforms {
    resolution: vec2<f32>,
    time:       f32,
    curvature:  f32,
    scanlines:  f32,
    padding:    vec3<f32>,
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

// Subtle CRT barrel curvature
fn curveUV(uv: vec2<f32>, k: f32) -> vec2<f32> {
    var centered = uv * 2.0 - 1.0;
    let offset = centered.yx / 4.0;
    centered = centered + centered * offset * offset * k;
    return centered * 0.5 + 0.5;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let uv = curveUV(in.uv, u.curvature);

    // Vignette / screen border cutoff
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Horizontal scanlines
    let scanCount = u.resolution.y * 0.5;
    let scanline = sin(uv.y * scanCount * 3.14159 + u.time * 2.0);
    let scanFactor = mix(1.0, 0.85 + 0.15 * scanline, u.scanlines);

    // Screen border corner vignette
    var vig = uv * (1.0 - uv.yx);
    let vignette = clamp(vig.x * vig.y * 25.0, 0.0, 1.0);

    let shadowAmount = (1.0 - (scanFactor * vignette)) * 0.45;
    return vec4<f32>(0.0, 0.0, 0.0, shadowAmount);
}

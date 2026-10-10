// ============================================================================
// BLACKWOOD SHADER PIPELINE: Chromatic Glitch & Signal Distortion
// ============================================================================
// Inputs:
//   - Vertex: Builtin vertex_index generating fullscreen quad [-1, 1]
//   - Uniforms:
//       resolution: vec2<f32>   // Canvas width and height in pixels
//       time:       f32         // Running timestamp in seconds
//       glitch:     f32         // Glitch intensity factor [0..1]
//       isCritical: f32         // Critical failure override (1.0 = violent tear)
// Outputs:
//   - Fragment: vec4<f32> chromatic RGB channel split and digital tear lines
// Fallback:
//   - CSS keyframe transform jitter & mix-blend-mode difference overlay
// Performance Notes:
//   - Only executes complex channel shifts when glitch > 0.01.
// ============================================================================

struct Uniforms {
    resolution: vec2<f32>,
    time:       f32,
    glitch:     f32,
    isCritical: f32,
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

fn hash11(p: f32) -> f32 {
    let p3 = fract(p * 0.1031);
    let p_calc = p3 * (p3 + 33.33);
    return fract((p3 + p_calc) * p_calc);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    if (u.glitch <= 0.01 && u.isCritical <= 0.01) {
        return vec4<f32>(0.0);
    }

    let t = u.time * 24.0;
    let blockRow = floor(in.uv.y * 30.0);
    let rowNoise = hash11(blockRow + floor(t));

    // Horizontal tear slice offset
    let tearTrigger = step(0.85 - u.glitch * 0.4, rowNoise);
    let offset = (hash11(blockRow * 2.3 + t) - 0.5) * 0.08 * (u.glitch + u.isCritical) * tearTrigger;

    // Chromatic aberration colors
    let rColor = vec4<f32>(1.0, 0.0, 0.0, 0.25 * (u.glitch + u.isCritical));
    let bColor = vec4<f32>(0.0, 0.2, 1.0, 0.25 * (u.glitch + u.isCritical));

    let finalAlpha = abs(offset) * 12.0 * (u.glitch + u.isCritical * 1.5);
    let tearColor = mix(rColor, bColor, step(0.5, rowNoise));

    return vec4<f32>(tearColor.rgb, clamp(finalAlpha, 0.0, 0.7));
}

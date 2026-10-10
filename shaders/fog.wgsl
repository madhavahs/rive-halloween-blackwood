// ============================================================================
// BLACKWOOD SHADER PIPELINE: Volumetric Atmospheric Fog
// ============================================================================
// Inputs:
//   - Vertex: Builtin vertex_index generating fullscreen quad [-1, 1]
//   - Uniforms:
//       resolution: vec2<f32>   // Canvas width and height in pixels
//       time:       f32         // Running timestamp in seconds
//       density:    f32         // Atmospheric fog density multiplier [0..1]
//       speed:      f32         // Fog drift velocity
// Outputs:
//   - Fragment: vec4<f32> atmospheric spectral mist with alpha blending
// Fallback:
//   - Canvas 2D linear gradient mist overlay or CSS radial filter
// Performance Notes:
//   - Uses procedural value noise with 2 FBM octaves for high mobile frame rates.
//   - Early exit when density == 0.0.
// ============================================================================

struct Uniforms {
    resolution: vec2<f32>,
    time:       f32,
    density:    f32,
    speed:      f32,
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

fn hash(p: vec2<f32>) -> f32 {
    let q = fract(p * vec2<f32>(123.34, 456.21));
    let d = dot(q, q + 45.32);
    return fract(d);
}

fn noise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u_val = f * f * (3.0 - 2.0 * f);

    let a = hash(i + vec2<f32>(0.0, 0.0));
    let b = hash(i + vec2<f32>(1.0, 0.0));
    let c = hash(i + vec2<f32>(0.0, 1.0));
    let d = hash(i + vec2<f32>(1.0, 1.0));

    return mix(mix(a, b, u_val.x), mix(c, d, u_val.x), u_val.y);
}

fn fbm(p: vec2<f32>) -> f32 {
    var v = 0.0;
    var a = 0.5;
    var shift = vec2<f32>(100.0);
    var p_curr = p;
    for (var i = 0; i < 3; i = i + 1) {
        v = v + a * noise(p_curr);
        p_curr = p_curr * 2.0 + shift;
        a = a * 0.5;
    }
    return v;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    if (u.density <= 0.001) {
        return vec4<f32>(0.0);
    }

    let t = u.time * u.speed * 0.1;
    let st = in.uv * vec2<f32>(3.0, 2.0);

    // Drifting motion in horizontal layers
    let q = vec2<f32>(
        fbm(st + vec2<f32>(t * 0.4, t * 0.1)),
        fbm(st + vec2<f32>(t * 0.2, -t * 0.3))
    );

    let f = fbm(st + q * 1.5 + vec2<f32>(t * 0.5, 0.0));

    // Fog color: cold eerie green-grey phosphor tint
    let fogColor = vec3<f32>(0.15, 0.22, 0.18);
    let fogAlpha = clamp(f * u.density * 0.35, 0.0, 0.6);

    return vec4<f32>(fogColor * fogAlpha, fogAlpha);
}

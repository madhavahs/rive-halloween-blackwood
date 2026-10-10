-- BLACKWOOD Surveillance Terminal Luau Controller
-- Handles procedural radar sweep, motion detection pings, and entity tracking telemetry

type TerminalScript = {
    radarAngle: number,
    pingIntensity: number,
    flickerTimer: number,
    sweepSpeed: number,
    reticlePath: Path,
    radarPath: Path,
    radarPaint: Paint,
    reticlePaint: Paint,
    textPaint: Paint,
    size: Vector,
}

function init(self: TerminalScript, context: Context): boolean
    self.radarAngle = 0
    self.pingIntensity = 0
    self.flickerTimer = 0
    self.sweepSpeed = 1.8
    return true
end

function resize(self: TerminalScript, size: Vector)
    self.size = size
end

function advance(self: TerminalScript, seconds: number): boolean
    self.radarAngle = (self.radarAngle + self.sweepSpeed * seconds) % (math.pi * 2)
    if self.pingIntensity > 0 then
        self.pingIntensity = math.max(0, self.pingIntensity - seconds * 1.5)
    end
    self.flickerTimer = self.flickerTimer + seconds
    return true
end

function draw(self: TerminalScript, renderer: Renderer)
    local w = self.size.x
    local h = self.size.y
    if w <= 0 or h <= 0 then
        return
    end

    -- Draw subtle CCTV surveillance crosshair overlay
    local cx = w * 0.5
    local cy = h * 0.5
    local armLen = 24

    self.reticlePath:reset()
    self.reticlePath:moveTo(Vector.xy(cx - armLen, cy))
    self.reticlePath:lineTo(Vector.xy(cx + armLen, cy))
    self.reticlePath:moveTo(Vector.xy(cx, cy - armLen))
    self.reticlePath:lineTo(Vector.xy(cx, cy + armLen))
    renderer:drawPath(self.reticlePath, self.reticlePaint)

    -- Draw procedural corner view brackets
    local margin = 32
    local bracket = 20
    self.radarPath:reset()
    -- Top Left
    self.radarPath:moveTo(Vector.xy(margin, margin + bracket))
    self.radarPath:lineTo(Vector.xy(margin, margin))
    self.radarPath:lineTo(Vector.xy(margin + bracket, margin))
    -- Top Right
    self.radarPath:moveTo(Vector.xy(w - margin - bracket, margin))
    self.radarPath:lineTo(Vector.xy(w - margin, margin))
    self.radarPath:lineTo(Vector.xy(w - margin, margin + bracket))
    -- Bottom Left
    self.radarPath:moveTo(Vector.xy(margin, h - margin - bracket))
    self.radarPath:lineTo(Vector.xy(margin, h - margin))
    self.radarPath:lineTo(Vector.xy(margin + bracket, h - margin))
    -- Bottom Right
    self.radarPath:moveTo(Vector.xy(w - margin - bracket, h - margin))
    self.radarPath:lineTo(Vector.xy(w - margin, h - margin))
    self.radarPath:lineTo(Vector.xy(w - margin, h - margin - bracket))

    renderer:drawPath(self.radarPath, self.radarPaint)
end

return function(context: Context): Layout<TerminalScript>
    return {
        radarAngle = 0,
        pingIntensity = 0,
        flickerTimer = 0,
        sweepSpeed = 1.8,
        reticlePath = Path.new(),
        radarPath = Path.new(),
        radarPaint = Paint.with({
            color = Color.rgb(51, 255, 119),
            style = "stroke",
            thickness = 2,
        }),
        reticlePaint = Paint.with({
            color = Color.rgb(51, 255, 119),
            style = "stroke",
            thickness = 1,
        }),
        textPaint = Paint.with({
            color = Color.rgb(51, 255, 119),
        }),
        size = Vector.xy(1280, 800),
        init = init,
        resize = resize,
        advance = advance,
        draw = draw,
    }
end

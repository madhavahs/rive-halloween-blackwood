import React, { useEffect, useRef } from "react";
import { SystemState } from "../game/types";

interface HalloweenRoomCanvasProps {
  activeCamera: number;
  systemState: SystemState;
  entityDistance: number;
  flashlightPosition: { x: number; y: number };
  flashlightOn: boolean;
  onEntityIlluminated?: (illuminated: boolean) => void;
}

export const HalloweenRoomCanvas: React.FC<HalloweenRoomCanvasProps> = ({
  activeCamera,
  systemState,
  entityDistance,
  flashlightPosition,
  flashlightOn,
  onEntityIlluminated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEntityIlluminatedRef = useRef(onEntityIlluminated);
  const lastIlluminatedRef = useRef<boolean | null>(null);

  useEffect(() => {
    onEntityIlluminatedRef.current = onEntityIlluminated;
  }, [onEntityIlluminated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    let animId: number;

    const render = (timestamp: number) => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const time = timestamp * 0.001;

      // Flashlight target in pixel coordinates
      const fx = flashlightPosition.x * width;
      const fy = flashlightPosition.y * height;

      // 1. Render Room Environment Background
      renderRoomEnvironment(ctx, activeCamera, width, height, time);

      // 2. Render Room's Halloween Character / Monster
      const monsterIlluminated = renderHalloweenMonster(
        ctx,
        activeCamera,
        systemState,
        entityDistance,
        width,
        height,
        time,
        fx,
        fy,
        flashlightOn
      );

      // Report illumination back to parent for panic calculation
      const isIllum = Boolean(flashlightOn && monsterIlluminated);
      if (lastIlluminatedRef.current !== isIllum) {
        lastIlluminatedRef.current = isIllum;
        onEntityIlluminatedRef.current?.(isIllum);
      }

      // 3. Climax Jumpscare Screen Overlay (during finalReveal)
      if (systemState === "finalReveal") {
        renderClimaxJumpscare(ctx, activeCamera, width, height, time);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
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
  }, [activeCamera, systemState, entityDistance, flashlightPosition, flashlightOn]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        zIndex: 2, // Above base Rive canvas, below flashlight & HUD
      }}
    />
  );
};

/**
 * 1. Environmental Halloween Room Background Artwork
 */
function renderRoomEnvironment(
  ctx: CanvasRenderingContext2D,
  camera: number,
  w: number,
  h: number,
  time: number
) {
  ctx.save();

  // Dark gothic room baseline
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#08060c");
  bgGrad.addColorStop(1, "#020104");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  if (camera === 1) {
    // CAM 01 // GRAND FOYER: Gothic Arched Window & Twin Staircase
    // Moonlight arched window in center
    const winX = w * 0.5;
    const winY = h * 0.35;
    const winW = w * 0.22;
    const winH = h * 0.45;

    ctx.fillStyle = "rgba(18, 32, 45, 0.4)";
    ctx.beginPath();
    ctx.arc(winX, winY - winH * 0.2, winW * 0.5, Math.PI, 0, false);
    ctx.rect(winX - winW * 0.5, winY - winH * 0.2, winW, winH * 0.7);
    ctx.fill();

    // Window mullions & spiderwebs
    ctx.strokeStyle = "#0d1822";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Grand Staircase Silhouettes Left and Right
    ctx.fillStyle = "#0c0a12";
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.32, h * 0.55);
    ctx.lineTo(w * 0.32, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w, h);
    ctx.lineTo(w * 0.68, h * 0.55);
    ctx.lineTo(w * 0.68, h);
    ctx.closePath();
    ctx.fill();

    // Carved Jack-o'-lanterns on Stair Steps with flickering candle light
    drawCarvedPumpkin(ctx, w * 0.15, h * 0.85, 34, time * 2);
    drawCarvedPumpkin(ctx, w * 0.85, h * 0.85, 38, time * 2 + 1.2);
  } else if (camera === 2) {
    // CAM 02 // WEST HALL: Long Gothic Corridor with Haunted Portraits
    // Vanishing perspective lines
    ctx.strokeStyle = "rgba(40, 25, 45, 0.4)";
    ctx.lineWidth = 2;
    const vanishX = w * 0.5;
    const vanishY = h * 0.48;

    // Floor and ceiling perspective
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(vanishX, vanishY);
      ctx.lineTo((w * i) / 5, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(vanishX, vanishY);
      ctx.lineTo((w * i) / 5, 0);
      ctx.stroke();
    }

    // Haunted Gilded Wall Portraits
    drawHauntedPortrait(ctx, w * 0.12, h * 0.38, w * 0.1, h * 0.28, time, 1);
    drawHauntedPortrait(ctx, w * 0.78, h * 0.38, w * 0.1, h * 0.28, time, 2);

    // Flickering candle sconce
    drawWallCandleSconce(ctx, w * 0.26, h * 0.42, time);
    drawWallCandleSconce(ctx, w * 0.74, h * 0.42, time + 0.8);
  } else if (camera === 3) {
    // CAM 03 // ARCHIVUM: Occult Library & Spellbooks
    // Floor occult containment circle
    ctx.save();
    ctx.translate(w * 0.5, h * 0.82);
    ctx.scale(1, 0.32);
    ctx.strokeStyle = "rgba(180, 70, 20, 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    // Inscribed pentagram / runes
    ctx.strokeStyle = "rgba(255, 90, 30, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const rx = Math.cos(angle) * w * 0.28;
      const ry = Math.sin(angle) * w * 0.28;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Towering bookshelves on left and right
    drawBookshelf(ctx, 0, h * 0.1, w * 0.22, h * 0.85);
    drawBookshelf(ctx, w * 0.78, h * 0.1, w * 0.22, h * 0.85);

    // Glowing carved pumpkin on library desk
    drawCarvedPumpkin(ctx, w * 0.5, h * 0.78, 42, time * 3);
  } else {
    // CAM 04 // MASTER BEDROOM: Gothic Four-Poster Canopy Bed
    // Bed canopy frame
    const bedX = w * 0.5;
    const bedY = h * 0.6;
    const bedW = w * 0.45;
    const bedH = h * 0.5;

    ctx.fillStyle = "#09060e";
    ctx.fillRect(bedX - bedW * 0.5, bedY - bedH * 0.4, bedW, bedH);

    // Bedposts
    ctx.fillStyle = "#151020";
    ctx.fillRect(bedX - bedW * 0.5 - 12, h * 0.15, 18, h * 0.85);
    ctx.fillRect(bedX + bedW * 0.5 - 6, h * 0.15, 18, h * 0.85);

    // Tattered velvet canopy drape
    ctx.fillStyle = "#220914";
    ctx.beginPath();
    ctx.moveTo(bedX - bedW * 0.5, h * 0.15);
    ctx.lineTo(bedX + bedW * 0.5, h * 0.15);
    ctx.lineTo(bedX + bedW * 0.45, h * 0.38);
    ctx.lineTo(bedX - bedW * 0.45, h * 0.38);
    ctx.closePath();
    ctx.fill();

    // Cracked ornate vanity mirror on left
    drawVanityMirror(ctx, w * 0.14, h * 0.35, w * 0.12, h * 0.35);
  }

  ctx.restore();
}

/**
 * 2. Halloween Resident Monster Renderer
 */
function renderHalloweenMonster(
  ctx: CanvasRenderingContext2D,
  camera: number,
  systemState: SystemState,
  entityDistance: number,
  w: number,
  h: number,
  time: number,
  fx: number,
  fy: number,
  flashlightOn: boolean
): boolean {
  // Monster position in room
  let mx = w * 0.5;
  let my = h * 0.55;

  if (camera === 1) {
    mx = w * 0.5;
    my = h * 0.62;
  } else if (camera === 2) {
    mx = w * 0.5;
    my = h * 0.5;
  } else if (camera === 3) {
    mx = w * 0.5;
    my = h * 0.52;
  } else if (camera === 4) {
    mx = w * 0.5;
    my = h * 0.54;
  }

  // Scale based on entity distance (larger when stalking closer)
  const proximityScale = 1.0 + ((100 - entityDistance) / 100) * 0.65;

  // Check distance to flashlight
  const dx = fx - mx;
  const dy = fy - my;
  const distToLight = Math.sqrt(dx * dx + dy * dy);
  const isIlluminated = distToLight < 160 && flashlightOn;

  ctx.save();
  ctx.translate(mx, my);
  ctx.scale(proximityScale, proximityScale);

  // Breathing / hovering bob animation
  const bobY = Math.sin(time * 3) * 6;
  ctx.translate(0, bobY);

  if (camera === 1) {
    // MONSTER 1: THE BURLAP SCARECROW / GOURD FIEND
    drawBurlapScarecrow(ctx, isIlluminated, time);
  } else if (camera === 2) {
    // MONSTER 2: LADY ELEANOR (SPECTRAL MOURNING BRIDE)
    drawSpectralBride(ctx, isIlluminated, time);
  } else if (camera === 3) {
    // MONSTER 3: THE PUMPKIN STALKER (JACK-O'-LANTERN LORD)
    drawPumpkinStalker(ctx, isIlluminated, time);
  } else {
    // MONSTER 4: THE CRIMSON VOID DEMON (HALLOWEEN ARCH-FIEND)
    drawCrimsonDemon(ctx, isIlluminated, time);
  }

  ctx.restore();

  return isIlluminated;
}

/**
 * Monster 1: The Burlap Scarecrow / Gourd Fiend (CAM 01 Foyer)
 */
function drawBurlapScarecrow(ctx: CanvasRenderingContext2D, lit: boolean, time: number) {
  // Ragged cloak / burlap body
  ctx.fillStyle = lit ? "#2b2216" : "#0e0b07";
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(55, 110);
  ctx.lineTo(-55, 110);
  ctx.closePath();
  ctx.fill();

  // Wooden cross arms & straw fingers
  ctx.fillStyle = lit ? "#4a3520" : "#140e08";
  ctx.fillRect(-85, -20, 170, 10);

  // Stitched burlap hood head (twitches when illuminated)
  const headTwitch = lit ? Math.sin(time * 25) * 4 : 0;
  ctx.save();
  ctx.translate(0, -70);
  ctx.rotate((headTwitch * Math.PI) / 180);

  ctx.fillStyle = lit ? "#5a452a" : "#1a130b";
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fill();

  // Crooked straw hat
  ctx.fillStyle = lit ? "#3d2d18" : "#120e06";
  ctx.beginPath();
  ctx.ellipse(0, -22, 54, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-22, -55, 44, 35);

  // Glowing amber button / stitched eyes
  const eyeGlow = lit ? "#ffaa00" : "#ff4400";
  ctx.fillStyle = eyeGlow;
  ctx.shadowColor = eyeGlow;
  ctx.shadowBlur = lit ? 16 : 8;

  ctx.beginPath();
  ctx.arc(-14, -4, 6, 0, Math.PI * 2);
  ctx.arc(14, -4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Stitched jagged mouth
  ctx.strokeStyle = lit ? "#1a1208" : "#000000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, 18);
  ctx.lineTo(20, 18);
  ctx.stroke();

  for (let s = -16; s <= 16; s += 8) {
    ctx.beginPath();
    ctx.moveTo(s, 12);
    ctx.lineTo(s, 24);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Monster 2: Lady Eleanor (The Spectral Mourning Bride) (CAM 02 West Hall)
 */
function drawSpectralBride(ctx: CanvasRenderingContext2D, lit: boolean, time: number) {
  // Translucent ghostly Victorian gown & hovering mist
  const alpha = lit ? 0.85 : 0.55;
  const ghostColor = lit ? `rgba(160, 220, 255, ${alpha})` : `rgba(70, 120, 160, ${alpha})`;
  ctx.fillStyle = ghostColor;
  ctx.shadowColor = "#88ddff";
  ctx.shadowBlur = lit ? 22 : 10;

  // Flowing ethereal dress
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.quadraticCurveTo(60, 40, 45 + Math.sin(time * 4) * 12, 125);
  ctx.quadraticCurveTo(0, 105, -45 - Math.sin(time * 4) * 12, 125);
  ctx.quadraticCurveTo(-60, 40, 0, -60);
  ctx.closePath();
  ctx.fill();

  // Floating bridal veil
  ctx.fillStyle = lit ? "rgba(200, 235, 255, 0.45)" : "rgba(80, 140, 180, 0.25)";
  ctx.beginPath();
  ctx.arc(0, -75, 42, Math.PI, 0, false);
  ctx.lineTo(36, 40);
  ctx.lineTo(-36, 40);
  ctx.closePath();
  ctx.fill();

  // Spectral Pale Head
  ctx.fillStyle = lit ? "#e0f4ff" : "#5588a0";
  ctx.beginPath();
  ctx.arc(0, -75, 26, 0, Math.PI * 2);
  ctx.fill();

  // Hollow weeping phantom eyes
  const eyeColor = lit ? "#00eeff" : "#0088cc";
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.ellipse(-10, -75, 4, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -75, 4, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ectoplasmic tears streaming down
  ctx.strokeStyle = eyeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -68);
  ctx.lineTo(-10, -48);
  ctx.moveTo(10, -68);
  ctx.lineTo(10, -48);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

/**
 * Monster 3: The Pumpkin Stalker (Jack-o'-Lantern Lord) (CAM 03 Archivum)
 */
function drawPumpkinStalker(ctx: CanvasRenderingContext2D, lit: boolean, time: number) {
  // Thorny vine body wrapping around
  ctx.strokeStyle = lit ? "#3d2a14" : "#120d06";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(35, 60, 15, 120);
  ctx.stroke();

  // Giant Carved Jack-o'-Lantern Head
  const flameFlicker = Math.sin(time * 18) * 0.15 + 0.85;
  const pumpkinColor = lit ? "#e65100" : "#4a1900";
  const glowColor = lit ? "#ffea00" : "#ff5500";

  ctx.save();
  ctx.translate(0, -50);

  // Ribbed pumpkin lobes
  ctx.fillStyle = pumpkinColor;
  ctx.beginPath();
  ctx.ellipse(-26, 0, 24, 46, -0.15, 0, Math.PI * 2);
  ctx.ellipse(26, 0, 24, 46, 0.15, 0, Math.PI * 2);
  ctx.ellipse(0, 0, 34, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  // Twisted Green Stem
  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.moveTo(-6, -48);
  ctx.quadraticCurveTo(4, -68, 14, -66);
  ctx.lineTo(10, -46);
  ctx.closePath();
  ctx.fill();

  // Fiery Carved Triangle Eyes
  ctx.fillStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = lit ? 28 * flameFlicker : 14 * flameFlicker;

  // Left Eye
  ctx.beginPath();
  ctx.moveTo(-24, -14);
  ctx.lineTo(-12, -26);
  ctx.lineTo(-8, -10);
  ctx.closePath();
  ctx.fill();

  // Right Eye
  ctx.beginPath();
  ctx.moveTo(24, -14);
  ctx.lineTo(12, -26);
  ctx.lineTo(8, -10);
  ctx.closePath();
  ctx.fill();

  // Carved Jagged Grinning Mouth with Sharp Teeth
  ctx.beginPath();
  ctx.moveTo(-32, 12);
  ctx.lineTo(-20, 6);
  ctx.lineTo(-12, 18);
  ctx.lineTo(0, 6);
  ctx.lineTo(12, 18);
  ctx.lineTo(20, 6);
  ctx.lineTo(32, 12);
  ctx.lineTo(24, 28);
  ctx.lineTo(14, 20);
  ctx.lineTo(0, 32);
  ctx.lineTo(-14, 20);
  ctx.lineTo(-24, 28);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Monster 4: The Crimson Void Demon (Halloween Arch-Fiend) (CAM 04 Master Bed)
 */
function drawCrimsonDemon(ctx: CanvasRenderingContext2D, lit: boolean, time: number) {
  // Massive bat / shadow wings with breathing animation
  const wingY = Math.sin(time * 2.5) * 8;
  ctx.fillStyle = lit ? "#18080d" : "#080204";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.quadraticCurveTo(-110, -110 + wingY, -140, 20 + wingY);
  ctx.quadraticCurveTo(-70, 40, 0, 80);
  ctx.quadraticCurveTo(70, 40, 140, 20 + wingY);
  ctx.quadraticCurveTo(110, -110 + wingY, 0, -20);
  ctx.fill();

  // Muscular shadow body
  ctx.fillStyle = lit ? "#220812" : "#0d0206";
  ctx.beginPath();
  ctx.ellipse(0, 20, 42, 68, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with Demonic Curved Horns
  ctx.save();
  ctx.translate(0, -60);

  // Massive Curved Ram/Gargoyle Horns
  ctx.fillStyle = lit ? "#4a121d" : "#1a0408";
  // Left Horn
  ctx.beginPath();
  ctx.moveTo(-18, -15);
  ctx.quadraticCurveTo(-70, -75, -60, -115);
  ctx.quadraticCurveTo(-45, -75, -6, -28);
  ctx.closePath();
  ctx.fill();

  // Right Horn
  ctx.beginPath();
  ctx.moveTo(18, -15);
  ctx.quadraticCurveTo(70, -75, 60, -115);
  ctx.quadraticCurveTo(45, -75, 6, -28);
  ctx.closePath();
  ctx.fill();

  // Demon Head
  ctx.fillStyle = lit ? "#2b0a15" : "#0f0207";
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();

  // 4 Piercing Glowing Ruby Eyes
  const eyeRed = lit ? "#ff1144" : "#aa0022";
  ctx.fillStyle = eyeRed;
  ctx.shadowColor = eyeRed;
  ctx.shadowBlur = lit ? 25 : 12;

  // Upper pair
  ctx.beginPath();
  ctx.ellipse(-14, -12, 6, 4, -0.2, 0, Math.PI * 2);
  ctx.ellipse(14, -12, 6, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Lower pair
  ctx.beginPath();
  ctx.ellipse(-10, 0, 4, 3, -0.1, 0, Math.PI * 2);
  ctx.ellipse(10, 0, 4, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Fanged gaping maw
  ctx.fillStyle = lit ? "#ff0033" : "#550011";
  ctx.beginPath();
  ctx.moveTo(-16, 14);
  ctx.lineTo(0, 26);
  ctx.lineTo(16, 14);
  ctx.lineTo(10, 18);
  ctx.lineTo(6, 14);
  ctx.lineTo(0, 20);
  ctx.lineTo(-6, 14);
  ctx.lineTo(-10, 18);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * 3. Final Reveal Climax Screen Overlay (Glass Shatter & Lunging Creature)
 */
function renderClimaxJumpscare(
  ctx: CanvasRenderingContext2D,
  camera: number,
  w: number,
  h: number,
  time: number
) {
  ctx.save();

  // Red alert screen strobes
  const strobe = Math.sin(time * 35) > 0 ? 0.25 : 0.08;
  ctx.fillStyle = `rgba(255, 20, 50, ${strobe})`;
  ctx.fillRect(0, 0, w, h);

  // Cracked CCTV camera lens fracture lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
  ctx.lineWidth = 2.5;
  const cx = w * 0.5;
  const cy = h * 0.5;

  ctx.beginPath();
  // Radial crack spokes
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    ctx.moveTo(cx, cy);
    const r = Math.min(w, h) * (0.35 + (a % 3) * 0.15);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  ctx.stroke();

  // Bloody claw scratches across lens
  ctx.strokeStyle = "rgba(255, 30, 60, 0.7)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.2);
  ctx.lineTo(w * 0.38, h * 0.65);
  ctx.moveTo(w * 0.45, h * 0.15);
  ctx.lineTo(w * 0.52, h * 0.7);
  ctx.moveTo(w * 0.6, h * 0.22);
  ctx.lineTo(w * 0.66, h * 0.68);
  ctx.stroke();

  ctx.restore();
}

/**
 * Helper: Carved Jack-o'-lantern with flickering fire
 */
function drawCarvedPumpkin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Pumpkin body
  ctx.fillStyle = "#8a3300";
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, 0, r * 0.45, r * 0.8, -0.1, 0, Math.PI * 2);
  ctx.ellipse(r * 0.35, 0, r * 0.45, r * 0.8, 0.1, 0, Math.PI * 2);
  ctx.ellipse(0, 0, r * 0.65, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.fillStyle = "#2e5a27";
  ctx.fillRect(-r * 0.1, -r * 0.95, r * 0.2, r * 0.25);

  // Flickering yellow-orange face
  const glow = "#ffbb00";
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 12 + Math.sin(time * 12) * 5;

  // Eyes
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, -r * 0.2);
  ctx.lineTo(-r * 0.15, -r * 0.4);
  ctx.lineTo(-r * 0.1, -r * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(r * 0.4, -r * 0.2);
  ctx.lineTo(r * 0.15, -r * 0.4);
  ctx.lineTo(r * 0.1, -r * 0.15);
  ctx.closePath();
  ctx.fill();

  // Tooth grin
  ctx.beginPath();
  ctx.moveTo(-r * 0.45, r * 0.15);
  ctx.lineTo(-r * 0.2, r * 0.35);
  ctx.lineTo(0, r * 0.18);
  ctx.lineTo(r * 0.2, r * 0.35);
  ctx.lineTo(r * 0.45, r * 0.15);
  ctx.lineTo(0, r * 0.42);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Helper: Haunted Victorian wall portrait with subtle gaze tracking
 */
function drawHauntedPortrait(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  index: number
) {
  ctx.save();
  // Frame
  ctx.fillStyle = "#3a2b16";
  ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  ctx.fillStyle = "#161008";
  ctx.fillRect(x, y, w, h);

  // Portrait silhouette
  ctx.fillStyle = "#2c2035";
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.4, w * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + w * 0.2, y + h * 0.55, w * 0.6, h * 0.45);

  // Subtly glowing tracking eyes
  const eyeGaze = Math.sin(time * 2 + index) * 2;
  ctx.fillStyle = "#ff2a4b";
  ctx.fillRect(x + w * 0.42 + eyeGaze, y + h * 0.38, 3, 3);
  ctx.fillRect(x + w * 0.55 + eyeGaze, y + h * 0.38, 3, 3);

  ctx.restore();
}

/**
 * Helper: Candle wall sconce with dynamic flickering flame
 */
function drawWallCandleSconce(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  // Metal bracket
  ctx.fillStyle = "#2a2216";
  ctx.fillRect(x - 4, y, 8, 24);

  // Wax candle
  ctx.fillStyle = "#ddd6c8";
  ctx.fillRect(x - 5, y - 20, 10, 20);

  // Flickering flame
  const flameH = 14 + Math.sin(time * 24) * 4;
  ctx.fillStyle = "#ffaa00";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(x, y - 20 - flameH);
  ctx.quadraticCurveTo(x + 7, y - 20 - flameH * 0.4, x, y - 20);
  ctx.quadraticCurveTo(x - 7, y - 20 - flameH * 0.4, x, y - 20 - flameH);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Helper: Bookshelf with occult volumes
 */
function drawBookshelf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = "#1c140c";
  ctx.fillRect(x, y, w, h);

  // Shelf dividers
  const shelves = 4;
  const shH = h / shelves;
  for (let i = 0; i < shelves; i++) {
    const sy = y + i * shH;
    ctx.fillStyle = "#2a1e12";
    ctx.fillRect(x, sy + shH - 8, w, 8);

    // Books on shelf
    const bookColors = ["#441111", "#112233", "#223311", "#332211", "#331133"];
    let bx = x + 10;
    while (bx < x + w - 20) {
      const bw = 12 + ((bx * 7) % 14);
      const bh = shH * 0.65 + ((bx * 13) % (shH * 0.25));
      ctx.fillStyle = bookColors[(bx + i) % bookColors.length] ?? "#332211";
      ctx.fillRect(bx, sy + shH - 8 - bh, bw, bh);
      bx += bw + 3;
    }
  }

  ctx.restore();
}

/**
 * Helper: Vanity mirror
 */
function drawVanityMirror(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = "#2c2016";
  ctx.fillRect(x - 6, y - 6, w + 12, h + 12);

  // Glass
  ctx.fillStyle = "rgba(40, 50, 60, 0.35)";
  ctx.fillRect(x, y, w, h);

  // Crack across glass
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y);
  ctx.lineTo(x + w * 0.6, y + h * 0.5);
  ctx.lineTo(x + w * 0.4, y + h);
  ctx.stroke();

  ctx.restore();
}

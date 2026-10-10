import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { soundEngine } from "../audio/SoundEngine";

interface Haunted3DExperienceProps {
  onExit: () => void;
  isAudioMuted: boolean;
}

const HAUNTED_PHRASES = [
  "He is behind you...",
  "Do not look away...",
  "Redrum... redrum...",
  "She wanders in the mirror...",
  "Leave this house...",
  "The Further awaits...",
  "Listen to the silence...",
  "He never sleeps...",
];

export const Haunted3DExperience: React.FC<Haunted3DExperienceProps> = ({
  onExit,
  isAudioMuted,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [emfLevel, setEmfLevel] = useState(1);
  const [lastWhisper, setLastWhisper] = useState<string>("Silence...");
  const [ghostDistance, setGhostDistance] = useState<number>(25);

  const flashlightRef = useRef<THREE.SpotLight | null>(null);
  const flashlightTargetRef = useRef<THREE.Object3D | null>(null);

  // Trigger ghost whisper
  const triggerWhisper = useCallback((customPhrase?: string) => {
    const phrase = customPhrase || HAUNTED_PHRASES[Math.floor(Math.random() * HAUNTED_PHRASES.length)]!;
    setLastWhisper(phrase);
    soundEngine.playGhostWhisperVoice(phrase);
  }, []);

  const toggleFlashlight = useCallback(() => {
    soundEngine.playFlashlightClick();
    setFlashlightOn((prev) => {
      const next = !prev;
      if (flashlightRef.current) {
        flashlightRef.current.intensity = next ? 6.5 : 0.0;
      }
      return next;
    });
  }, []);

  const playMusicBox = useCallback(() => {
    soundEngine.playMusicBoxMelody();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040206);
    scene.fog = new THREE.FogExp2(0x040206, 0.038);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.6, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Ambient & Volumetric Lighting
    const ambientLight = new THREE.AmbientLight(0x181024, 0.45);
    scene.add(ambientLight);

    // Candle point lights along hallway
    const candle1 = new THREE.PointLight(0xff7722, 1.8, 14);
    candle1.position.set(-2.8, 2.5, -4);
    scene.add(candle1);

    const candle2 = new THREE.PointLight(0xff7722, 1.8, 14);
    candle2.position.set(2.8, 2.5, -12);
    scene.add(candle2);

    // Eerie Cyan Phantom Light
    const phantomLight = new THREE.PointLight(0x33ccff, 2.2, 12);
    phantomLight.position.set(0, 1.8, -15);
    scene.add(phantomLight);

    // 3. Player 3D Flashlight Spotlight
    const spotLight = new THREE.SpotLight(0xfff4d6, 6.5, 40, Math.PI / 5, 0.45, 1.2);
    spotLight.position.copy(camera.position);
    spotLight.castShadow = true;
    scene.add(spotLight);
    flashlightRef.current = spotLight;

    const spotLightTarget = new THREE.Object3D();
    spotLightTarget.position.set(0, 1.6, -10);
    scene.add(spotLightTarget);
    spotLight.target = spotLightTarget;
    flashlightTargetRef.current = spotLightTarget;

    // 4. Haunted 3D Corridor Architecture
    // Floor
    const floorGeo = new THREE.PlaneGeometry(8, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141218,
      roughness: 0.65,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -20);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(8, 60);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x0c0812,
      roughness: 0.9,
    });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4.0, -20);
    scene.add(ceiling);

    // Left Wall
    const wallGeo = new THREE.PlaneGeometry(60, 4.0);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1a1220,
      roughness: 0.85,
    });
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-4.0, 2.0, -20);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(4.0, 2.0, -20);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Far Cursed Red Door (The Further - Insidious tribute)
    const doorGeo = new THREE.BoxGeometry(2.4, 3.4, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x880b18,
      roughness: 0.4,
      metalness: 0.1,
    });
    const redDoor = new THREE.Mesh(doorGeo, doorMat);
    redDoor.position.set(0, 1.7, -49);
    scene.add(redDoor);

    // 5. 3D Floating Haunted Words (Rendered onto Billboards)
    const createTextSprite = (text: string, color = "#ff2a4b", font = "bold 44px 'Courier New', monospace") => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, 512, 128);
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 256, 64);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4.5, 1.1, 1);
      return sprite;
    };

    const wordSprites: THREE.Sprite[] = [
      createTextSprite("HE IS BEHIND YOU", "#ff2a4b"),
      createTextSprite("REDRUM", "#ff1133"),
      createTextSprite("DO NOT LOOK", "#66ccff"),
      createTextSprite("THE FURTHER AWAITS", "#ffaa33"),
      createTextSprite("SHE WALKS AT MIDNIGHT", "#aa66ff"),
    ];

    wordSprites[0]!.position.set(-2.2, 2.6, -7);
    wordSprites[1]!.position.set(2.4, 1.9, -14);
    wordSprites[2]!.position.set(-1.8, 2.8, -21);
    wordSprites[3]!.position.set(0, 3.2, -32);
    wordSprites[4]!.position.set(2.0, 2.2, -40);

    wordSprites.forEach((sp) => scene.add(sp));

    // 6. 3D Animated Ghost: The Spectral Bride (Lady of Blackwood)
    const ghostGroup = new THREE.Group();
    // Head / Veil
    const headGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0x99ddff,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
      emissive: 0x113344,
    });
    const head = new THREE.Mesh(headGeo, ghostMat);
    head.position.y = 1.9;
    ghostGroup.add(head);

    // Glowing Phantom Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x66ffff });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeMat);
    leftEye.position.set(-0.14, 1.95, 0.36);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeMat);
    rightEye.position.set(0.14, 1.95, 0.36);
    ghostGroup.add(leftEye);
    ghostGroup.add(rightEye);

    // Floating Gown (Cone + Displacement)
    const dressGeo = new THREE.ConeGeometry(0.85, 2.2, 32, 1, true);
    const dressMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.5,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    const dress = new THREE.Mesh(dressGeo, dressMat);
    dress.position.y = 0.9;
    ghostGroup.add(dress);

    ghostGroup.position.set(0, 0.4, -18);
    scene.add(ghostGroup);

    // 7. 3D Floating Pumpkin Fiend
    const pumpkinGroup = new THREE.Group();
    const pumpkinGeo = new THREE.SphereGeometry(0.65, 24, 18);
    pumpkinGeo.scale(1.2, 0.9, 1.2);
    const pumpkinMat = new THREE.MeshStandardMaterial({
      color: 0xd95b00,
      roughness: 0.7,
      emissive: 0x441100,
    });
    const pumpkinMesh = new THREE.Mesh(pumpkinGeo, pumpkinMat);
    pumpkinGroup.add(pumpkinMesh);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5a1e });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.65;
    pumpkinGroup.add(stem);

    pumpkinGroup.position.set(2.4, 1.6, -9);
    scene.add(pumpkinGroup);

    // 8. 3D Possessed Antique Rocking Chair (The Conjuring tribute)
    const chairGroup = new THREE.Group();
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), seatMat);
    seat.position.y = 0.6;
    chairGroup.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.1), seatMat);
    backrest.position.set(0, 1.15, -0.35);
    chairGroup.add(backrest);

    // Rockers
    const rockerGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8);
    const rockerLeft = new THREE.Mesh(rockerGeo, seatMat);
    rockerLeft.rotation.z = Math.PI / 2;
    rockerLeft.position.set(-0.35, 0.08, 0);
    const rockerRight = new THREE.Mesh(rockerGeo, seatMat);
    rockerRight.rotation.z = Math.PI / 2;
    rockerRight.position.set(0.35, 0.08, 0);
    chairGroup.add(rockerLeft);
    chairGroup.add(rockerRight);

    chairGroup.position.set(-2.6, 0.1, -11);
    chairGroup.rotation.y = Math.PI / 5;
    scene.add(chairGroup);

    // 9. Particle Dust Motes / Ectoplasm
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = Math.random() * 4;
      particlePositions[i + 2] = -Math.random() * 48;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.08,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Pointer Tracking for 3D Flashlight
    const mouse = { x: 0, y: 0 };
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Handle Keyboard Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "f") {
        toggleFlashlight();
      } else if (key === "v") {
        triggerWhisper();
      } else if (key === "b") {
        playMusicBox();
      } else if (key === "escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 11. Animation Loop & Sound Triggers
    let isRunning = true;
    let animId: number;
    let lastGhostSoundTime = 0;

    const clock = new THREE.Clock();

    const animate = () => {
      if (!isRunning) return;

      const elapsed = clock.getElapsedTime();

      // Smooth flashlight look target
      const targetX = mouse.x * 6.0;
      const targetY = 1.6 + mouse.y * 3.5;
      const targetZ = -12;

      spotLightTarget.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
      spotLight.position.copy(camera.position);

      // Flickering candle flame intensities
      candle1.intensity = 1.6 + Math.sin(elapsed * 12) * 0.4 + Math.cos(elapsed * 23) * 0.2;
      candle2.intensity = 1.6 + Math.sin(elapsed * 10 + 2) * 0.4;

      // Animate 3D Spectral Bride (glide towards player, float vertically)
      ghostGroup.position.y = 0.4 + Math.sin(elapsed * 2.2) * 0.25;
      ghostGroup.position.x = Math.sin(elapsed * 0.8) * 0.9;
      // Drift forward slowly towards player
      ghostGroup.position.z = -18 + Math.sin(elapsed * 0.35) * 8;
      phantomLight.position.copy(ghostGroup.position);

      // Animate Pumpkin Fiend (rotate and bob)
      pumpkinGroup.rotation.y = elapsed * 0.8;
      pumpkinGroup.position.y = 1.6 + Math.sin(elapsed * 3) * 0.2;

      // Animate Rocking Chair (The Conjuring rocking motion)
      chairGroup.rotation.x = Math.sin(elapsed * 3.5) * 0.12;

      // Animate Floating Words (pulse opacity and gentle float)
      wordSprites.forEach((sp, idx) => {
        sp.position.y += Math.sin(elapsed * 2 + idx) * 0.002;
        const mat = sp.material as THREE.SpriteMaterial;
        mat.opacity = 0.55 + Math.sin(elapsed * 2.5 + idx * 1.5) * 0.35;
      });

      // Animate Dust Particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        const currentY = arr[i];
        if (typeof currentY === "number") {
          const nextY = currentY - 0.005;
          arr[i] = nextY < 0 ? 4.0 : nextY;
        }
      }
      posAttr.needsUpdate = true;

      // Calculate Ghost Distance to Camera
      const dist = camera.position.distanceTo(ghostGroup.position);
      setGhostDistance(Math.round(dist));

      // Calculate EMF Level (1 to 5) based on proximity
      const newEmf = dist < 7 ? 5 : dist < 11 ? 4 : dist < 15 ? 3 : dist < 20 ? 2 : 1;
      setEmfLevel(newEmf);

      // Periodic EMF Beeps & Background Ghost Whispers
      if (elapsed - lastGhostSoundTime > 3.0) {
        if (!isAudioMuted) {
          if (newEmf >= 3) {
            soundEngine.playEMFDetectorBeep(newEmf / 5);
          }
          // Periodic ghost whisper every 11 seconds
          if (Math.random() < 0.28) {
            triggerWhisper();
          }
        }
        lastGhostSoundTime = elapsed;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Initial greeting ghost whisper
    triggerWhisper("Welcome to the Hall of Whispers...");

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onExit, isAudioMuted, toggleFlashlight, triggerWhisper, playMusicBox]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#050308",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "ui-monospace, 'SF Mono', 'Courier New', monospace",
        color: "#33ff77",
        overflow: "hidden",
      }}
    >
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          inset: 0,
          cursor: "crosshair",
        }}
      />

      {/* TOP HUD: EMF RADAR & HORROR TELEMETRY */}
      <div
        style={{
          position: "relative",
          zIndex: 25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          backgroundColor: "rgba(6, 3, 10, 0.8)",
          borderBottom: "1px solid rgba(255, 170, 51, 0.3)",
          pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ color: "#ff2a4b", fontWeight: "bold", animation: "pulse 1s infinite" }}>
            ● 3D SPECTRAL INVESTIGATION
          </span>
          <span style={{ color: "#ffaa33" }}>BLACKWOOD ESTATE // THE FURTHER</span>
          <span style={{ color: "#66ccff" }}>SPECTER DIST: {ghostDistance}m</span>
        </div>

        {/* EMF Meter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: emfLevel >= 4 ? "#ff2a4b" : "#ffaa33" }}>
            EMF DETECTOR:
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                style={{
                  width: "12px",
                  height: "16px",
                  backgroundColor:
                    lvl <= emfLevel
                      ? lvl >= 4
                        ? "#ff2a4b"
                        : lvl === 3
                        ? "#ffaa33"
                        : "#33ff77"
                      : "rgba(255,255,255,0.1)",
                  boxShadow: lvl <= emfLevel ? "0 0 6px currentColor" : "none",
                  border: "1px solid rgba(0,0,0,0.5)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FLOATING WHISPER BANNER */}
      <div
        style={{
          position: "relative",
          zIndex: 25,
          alignSelf: "center",
          backgroundColor: "rgba(10, 5, 15, 0.75)",
          border: "1px solid rgba(100, 200, 255, 0.35)",
          boxShadow: "0 0 15px rgba(100, 200, 255, 0.2)",
          padding: "8px 24px",
          borderRadius: "4px",
          color: "#b0e0ff",
          fontSize: "14px",
          fontStyle: "italic",
          letterSpacing: "0.08em",
          pointerEvents: "none",
          marginTop: "12px",
        }}
      >
        🗣️ GHOST WHISPER: "{lastWhisper}"
      </div>

      {/* BOTTOM CONTROLS & ACTIONS */}
      <div
        style={{
          position: "relative",
          zIndex: 25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          backgroundColor: "rgba(6, 3, 10, 0.85)",
          borderTop: "1px solid rgba(255, 170, 51, 0.3)",
          pointerEvents: "auto",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ fontSize: "11px", color: "#88aa99" }}>
          AIM POINTER: Direct 3D Flashlight • MOVE CLOSE: Detect EMF • ESC: Return
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={toggleFlashlight}
            style={{
              backgroundColor: flashlightOn ? "rgba(255, 244, 214, 0.2)" : "rgba(10, 10, 10, 0.6)",
              color: flashlightOn ? "#fff4d6" : "#666",
              border: `1px solid ${flashlightOn ? "#fff4d6" : "#444"}`,
              padding: "8px 16px",
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔦 LIGHT: {flashlightOn ? "ON" : "OFF"} [F]
          </button>

          <button
            onClick={() => triggerWhisper()}
            style={{
              backgroundColor: "rgba(100, 200, 255, 0.15)",
              color: "#66ccff",
              border: "1px solid #66ccff",
              padding: "8px 16px",
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🗣️ GHOST WHISPER [V]
          </button>

          <button
            onClick={playMusicBox}
            style={{
              backgroundColor: "rgba(255, 170, 51, 0.15)",
              color: "#ffaa33",
              border: "1px solid #ffaa33",
              padding: "8px 16px",
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🎵 MUSIC BOX [B]
          </button>

          <button
            onClick={onExit}
            style={{
              backgroundColor: "rgba(255, 42, 75, 0.25)",
              color: "#ff2a4b",
              border: "1px solid #ff2a4b",
              padding: "8px 16px",
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🚪 RETURN TO SURVEILLANCE [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};

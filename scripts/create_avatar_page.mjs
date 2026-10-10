import fs from "fs";
import path from "path";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: transparent;
    width: 270px;
    height: 200px;
    overflow: hidden;
    font-family: Consolas, monospace;
  }
  .webcam-card {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 60%, #101622 0%, #050810 100%);
    border: 2px solid #33ff77;
    border-radius: 6px;
    box-shadow: 0 0 15px rgba(51, 255, 119, 0.4);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }
  .webcam-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 22px;
    background: rgba(5, 10, 15, 0.85);
    border-bottom: 1px solid rgba(51, 255, 119, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 10px;
    color: #33ff77;
    z-index: 10;
  }
  .rec-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff2a4b;
    box-shadow: 0 0 6px #ff2a4b;
    display: inline-block;
    margin-right: 4px;
    animation: blink 1s infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

  /* Boy Avatar SVG Container */
  .avatar-stage {
    width: 180px;
    height: 165px;
    position: relative;
    transform-origin: bottom center;
    animation: headBob 2.5s ease-in-out infinite alternate;
  }
  @keyframes headBob {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-2px) rotate(0.8deg); }
    100% { transform: translateY(1px) rotate(-0.8deg); }
  }

  /* Audio Waveform Footer */
  .webcam-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: rgba(5, 10, 15, 0.85);
    border-top: 1px solid rgba(51, 255, 119, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 9px;
    color: #aaffbb;
    z-index: 10;
  }
  .soundwave {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 10px;
  }
  .soundbar {
    width: 2px;
    background: #33ff77;
    border-radius: 1px;
    animation: wave 0.4s infinite alternate;
  }
  .soundbar:nth-child(2) { animation-delay: 0.1s; height: 6px; }
  .soundbar:nth-child(3) { animation-delay: 0.2s; height: 10px; }
  .soundbar:nth-child(4) { animation-delay: 0.15s; height: 4px; }
  .soundbar:nth-child(5) { animation-delay: 0.25s; height: 8px; }
  @keyframes wave {
    0% { height: 2px; }
    100% { height: 10px; }
  }

  /* Dynamic Mood Lighting Overlays */
  .mood-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    mix-blend-mode: overlay;
    transition: background 0.8s ease;
  }
  .mood-normal { background: rgba(51, 255, 119, 0.12); }
  .mood-dossier { background: rgba(255, 170, 51, 0.15); }
  .mood-further { background: rgba(100, 200, 255, 0.18); }
  .mood-panic {
    background: rgba(255, 42, 75, 0.35);
    animation: panicFlash 0.35s infinite alternate;
  }
  @keyframes panicFlash { 0% { opacity: 0.3; } 100% { opacity: 0.9; } }
  .mood-win { background: rgba(51, 255, 119, 0.25); }

  /* Mouth talking animation */
  .mouth-open {
    transform-origin: center;
    animation: talk 0.22s infinite alternate ease-in-out;
  }
  @keyframes talk {
    0% { transform: scaleY(0.3); }
    100% { transform: scaleY(1.4); }
  }

  /* Eye blinking */
  .eyes {
    transform-origin: center;
    animation: eyeBlink 3.2s infinite;
  }
  @keyframes eyeBlink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
</style>
</head>
<body>
<div class="webcam-card" id="card">
  <div class="mood-overlay mood-normal" id="mood"></div>
  
  <div class="webcam-header">
    <div><span class="rec-dot"></span><span>LIVE LEO // NARRATOR</span></div>
    <span id="badge" style="color: #33ff77; font-weight: bold;">[SURVEILLANCE]</span>
  </div>

  <!-- Animated Stylized Boy SVG Avatar -->
  <div class="avatar-stage">
    <svg viewBox="0 0 200 190" width="100%" height="100%">
      <!-- Hoodie Shoulders / Body -->
      <path d="M 30,190 Q 60,140 100,140 Q 140,140 170,190 Z" fill="#1b202c" stroke="#2a3345" stroke-width="2"/>
      <!-- Inner T-shirt collar -->
      <path d="M 85,150 Q 100,165 115,150 Z" fill="#33ff77" opacity="0.8"/>
      
      <!-- Neck -->
      <rect x="90" y="125" width="20" height="20" fill="#f8cca4" rx="3"/>

      <!-- Head / Face -->
      <path d="M 68,90 Q 68,135 100,135 Q 132,135 132,90 Q 132,55 100,55 Q 68,55 68,90 Z" fill="#fbd8b5"/>
      <!-- Ears -->
      <circle cx="68" cy="95" r="7" fill="#f8cca4"/>
      <circle cx="132" cy="95" r="7" fill="#f8cca4"/>

      <!-- Cheeks Blush -->
      <ellipse cx="80" cy="105" rx="5" ry="3" fill="#ff9999" opacity="0.5"/>
      <ellipse cx="120" cy="105" rx="5" ry="3" fill="#ff9999" opacity="0.5"/>

      <!-- Eyes -->
      <g class="eyes" id="eyeGroup">
        <circle cx="84" cy="92" r="5" fill="#1b202c"/>
        <circle cx="116" cy="92" r="5" fill="#1b202c"/>
        <!-- Catchlights -->
        <circle cx="82.5" cy="90.5" r="1.8" fill="#ffffff"/>
        <circle cx="114.5" cy="90.5" r="1.8" fill="#ffffff"/>
      </g>

      <!-- Eyebrows -->
      <path id="browL" d="M 77,83 Q 84,80 91,83" stroke="#5a3d28" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path id="browR" d="M 109,83 Q 116,80 123,83" stroke="#5a3d28" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Nose -->
      <path d="M 100,96 L 98,103 L 102,103" stroke="#e0aa80" stroke-width="1.8" stroke-linecap="round" fill="none"/>

      <!-- Mouth (Animated) -->
      <g id="mouthWrapper" class="mouth-open">
        <path id="mouth" d="M 92,114 Q 100,123 108,114 Z" fill="#cc3344" stroke="#881122" stroke-width="1"/>
      </g>

      <!-- Hair (Cool Spiky Modern Anime Hair) -->
      <path d="M 66,75 Q 60,45 85,38 Q 100,28 115,35 Q 140,42 134,75 Q 128,52 110,48 Q 90,48 78,58 Q 68,66 66,75 Z" fill="#4a2e1b"/>
      <path d="M 72,55 Q 85,62 88,75 Q 92,60 102,68 Q 108,58 118,72 Q 125,60 130,70" stroke="#3d2414" stroke-width="3" fill="none"/>

      <!-- Gamer Headset (Green LED glowing headband + cups) -->
      <!-- Headband -->
      <path d="M 64,88 A 38,42 0 0,1 136,88" stroke="#222834" stroke-width="7" fill="none"/>
      <path d="M 66,86 A 36,40 0 0,1 134,86" stroke="#33ff77" stroke-width="2" fill="none" opacity="0.9"/>
      <!-- Left Ear Cup -->
      <rect x="56" y="82" width="12" height="26" rx="5" fill="#1b202c" stroke="#33ff77" stroke-width="1.5"/>
      <!-- Right Ear Cup -->
      <rect x="132" y="82" width="12" height="26" rx="5" fill="#1b202c" stroke="#33ff77" stroke-width="1.5"/>
      <!-- Microphone Boom -->
      <path d="M 62,100 Q 64,120 85,120" stroke="#222834" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="86" cy="120" r="3.5" fill="#33ff77" filter="drop-shadow(0 0 3px #33ff77)"/>
    </svg>
  </div>

  <div class="webcam-footer">
    <div class="soundwave" id="soundwave">
      <div class="soundbar"></div>
      <div class="soundbar"></div>
      <div class="soundbar"></div>
      <div class="soundbar"></div>
      <div class="soundbar"></div>
    </div>
    <span id="captionText">"Yo guys! Welcome to Blackwood..."</span>
  </div>
</div>

<script>
  // Timeline controller for 60-second video synchronized with speech clips
  const mood = document.getElementById("mood");
  const badge = document.getElementById("badge");
  const card = document.getElementById("card");
  const mouthWrapper = document.getElementById("mouthWrapper");
  const captionText = document.getElementById("captionText");
  const browL = document.getElementById("browL");
  const browR = document.getElementById("browR");

  const startTime = Date.now();

  function update() {
    const elapsed = (Date.now() - startTime) / 1000;

    // Phase 1 (0s - 10.5s): Surveillance Intro
    if (elapsed < 10.5) {
      mood.className = "mood-overlay mood-normal";
      badge.textContent = "[SURVEILLANCE]";
      badge.style.color = "#33ff77";
      card.style.borderColor = "#33ff77";
      captionText.textContent = "Yo guys! Welcome to Blackwood Manor!";
      mouthWrapper.className = (elapsed < 10.2) ? "mouth-open" : "";
    }
    // Phase 2 (10.5s - 22s): Monster Dossier
    else if (elapsed < 22) {
      mood.className = "mood-overlay mood-dossier";
      badge.textContent = "[OCCULT DOSSIER]";
      badge.style.color = "#ffaa33";
      card.style.borderColor = "#ffaa33";
      captionText.textContent = "Check out the 4 haunted entities!";
      mouthWrapper.className = (elapsed > 11.2 && elapsed < 21.8) ? "mouth-open" : "";
    }
    // Phase 3 (22s - 37s): The Further 3D
    else if (elapsed < 37) {
      mood.className = "mood-overlay mood-further";
      badge.textContent = "[THE FURTHER 3D]";
      badge.style.color = "#66ccff";
      card.style.borderColor = "#66ccff";
      captionText.textContent = "EMF spiking! Entering 3D realm...";
      mouthWrapper.className = (elapsed > 23 && elapsed < 35.5) ? "mouth-open" : "";
    }
    // Phase 4 (37s - 49s): Panic & Final Reveal
    else if (elapsed < 49) {
      mood.className = "mood-overlay mood-panic";
      badge.textContent = "[CRITICAL BREACH]";
      badge.style.color = "#ff2a4b";
      card.style.borderColor = "#ff2a4b";
      captionText.textContent = "ALARMS! IT'S BREAKING THROUGH!";
      mouthWrapper.className = (elapsed > 38 && elapsed < 46.5) ? "mouth-open" : "";
      // Scared eyebrows
      browL.setAttribute("d", "M 77,80 Q 84,84 91,81");
      browR.setAttribute("d", "M 109,81 Q 116,84 123,80");
    }
    // Phase 5 (49s - 60s): Victory Reboot
    else {
      mood.className = "mood-overlay mood-win";
      badge.textContent = "[CONTAINMENT PURGED]";
      badge.style.color = "#33ff77";
      card.style.borderColor = "#33ff77";
      captionText.textContent = "Emergency reboot! We survived!";
      mouthWrapper.className = (elapsed > 50 && elapsed < 59.5) ? "mouth-open" : "";
      // Happy eyebrows
      browL.setAttribute("d", "M 77,83 Q 84,80 91,83");
      browR.setAttribute("d", "M 109,83 Q 116,80 123,83");
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
</script>
</body>
</html>
`;

fs.writeFileSync(path.resolve("recordings/avatar.html"), htmlContent);
console.log("Created avatar.html");

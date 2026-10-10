import fs from "fs";
import path from "path";

// Generates a 60-second procedural horror soundtrack for the video walkthrough
function generateWav(filename, durationSec = 60, sampleRate = 44100) {
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const dataSize = totalSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;

  // Music box bell frequencies (E minor pentatonic: E4, G4, A4, B4, D5)
  const bellFrequencies = [329.63, 392.0, 440.0, 493.88, 587.33];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    let left = 0;
    let right = 0;

    // 1. BASE HORROR DRONE (Sub-bass 55Hz A1 + 110Hz A2)
    const drone = 0.22 * Math.sin(2 * Math.PI * 55 * t) +
                  0.12 * Math.sin(2 * Math.PI * 110 * t) +
                  0.05 * Math.sin(2 * Math.PI * 82.5 * t);
    left += drone;
    right += drone;

    // 2. RADIO STATIC & TAPE NOISE (Subtle eerie noise floor)
    const noise = (Math.random() * 2 - 1) * 0.035;
    left += noise;
    right += noise * 0.9;

    // 3. SECTION 3 (22s - 38s): THE FURTHER & MUSIC BOX
    if (t >= 22 && t <= 38) {
      const spectralT = t - 22;
      // Ghostly formant resonance (sinusoidal frequency modulation)
      const formantFreq = 420 + Math.sin(spectralT * 1.5) * 180;
      const formant = 0.08 * Math.sin(2 * Math.PI * formantFreq * t) * (1 - Math.cos((spectralT / 16) * 2 * Math.PI));
      left += formant * 0.7;
      right += formant * 1.1;

      // EMF Detector rapid clicks (intermittent Geiger clicks)
      if (Math.random() < 0.008) {
        const click = (Math.random() * 2 - 1) * 0.25;
        left += click;
        right += click;
      }

      // Music box chimes (notes every 1.8 seconds)
      const noteIndex = Math.floor(spectralT / 1.6);
      const notePhase = (spectralT % 1.6);
      if (noteIndex < 8) {
        const freq = bellFrequencies[noteIndex % bellFrequencies.length];
        const decay = Math.exp(-notePhase * 4.5);
        const bell = 0.18 * Math.sin(2 * Math.PI * freq * t) * decay +
                     0.06 * Math.sin(2 * Math.PI * freq * 2.76 * t) * decay;
        left += bell * (0.6 + (noteIndex % 2) * 0.4);
        right += bell * (0.9 - (noteIndex % 2) * 0.3);
      }
    }

    // 4. HEARTBEAT ACCELERATION (35s to 50s)
    if (t >= 32 && t <= 50) {
      const panicT = t - 32;
      const bpm = 60 + (panicT / 18) * 80; // Accelerates from 60 to 140 BPM
      const beatFreq = bpm / 60;
      const beatPhase = (t * beatFreq) % 1;
      // Double thump (lub-dub)
      const thump1 = Math.exp(-beatPhase * 35) * Math.sin(2 * Math.PI * 65 * t);
      const thump2 = (beatPhase > 0.25) ? Math.exp(-(beatPhase - 0.25) * 40) * Math.sin(2 * Math.PI * 52 * t) : 0;
      const heartbeat = (thump1 + thump2) * (0.2 + (panicT / 18) * 0.35);
      left += heartbeat;
      right += heartbeat;
    }

    // 5. CLIMAX HORROR STINGER & JUMPSCARE (46s - 49s)
    if (t >= 45.5 && t <= 49.5) {
      const stingerT = t - 45.5;
      const stingerEnv = Math.exp(-stingerT * 1.2);
      // Dissonant tritone cluster (C# + G + A#) + white noise crash
      const dissonance = 0.35 * (
        Math.sin(2 * Math.PI * 277.18 * t) +
        Math.sin(2 * Math.PI * 392.00 * t) +
        Math.sin(2 * Math.PI * 466.16 * t)
      ) * stingerEnv;
      const crash = (Math.random() * 2 - 1) * 0.28 * Math.exp(-stingerT * 3.0);
      left += dissonance + crash;
      right += dissonance + crash;
    }

    // 6. TERMINAL REBOOT CHIRP (51s)
    if (t >= 51.0 && t <= 52.2) {
      const rebootT = t - 51.0;
      const rebootChirp = 0.18 * Math.sin(2 * Math.PI * (880 + rebootT * 440) * t) * Math.exp(-rebootT * 3.5);
      left += rebootChirp;
      right += rebootChirp;
    }

    // Master fade-in (first 1s) and fade-out (last 2s)
    let masterVol = 0.95;
    if (t < 1.0) masterVol *= t;
    if (t > durationSec - 2.0) masterVol *= Math.max(0, (durationSec - t) / 2.0);

    left = Math.max(-1, Math.min(1, left * masterVol));
    right = Math.max(-1, Math.min(1, right * masterVol));

    // Convert to 16-bit PCM integer (-32768 to 32767)
    buffer.writeInt16LE(Math.floor(left * 32767), offset);
    buffer.writeInt16LE(Math.floor(right * 32767), offset + 2);
    offset += 4;
  }

  const outPath = path.resolve(filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated procedural horror soundtrack: ${outPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

generateWav("recordings/soundtrack.wav", 60.0);

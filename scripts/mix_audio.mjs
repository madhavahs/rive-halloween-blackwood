import { spawn } from "child_process";
import path from "path";

async function mixAudio() {
  const soundtrack = path.resolve("recordings/soundtrack.wav");
  const c1 = path.resolve("recordings/voice/clip_1.mp3");
  const c2 = path.resolve("recordings/voice/clip_2.mp3");
  const c3 = path.resolve("recordings/voice/clip_3.mp3");
  const c4 = path.resolve("recordings/voice/clip_4.mp3");
  const c5 = path.resolve("recordings/voice/clip_5.mp3");
  const outWav = path.resolve("recordings/master_audio.wav");

  // Delays in ms:
  // c1: 500ms
  // c2: 11500ms
  // c3: 23000ms
  // c4: 38000ms
  // c5: 49500ms
  const filterComplex = 
    `[0:a]volume=0.45[bg];` +
    `[1:a]adelay=500|500,volume=1.45[v1];` +
    `[2:a]adelay=11500|11500,volume=1.45[v2];` +
    `[3:a]adelay=23000|23000,volume=1.45[v3];` +
    `[4:a]adelay=38000|38000,volume=1.55[v4];` +
    `[5:a]adelay=49500|49500,volume=1.45[v5];` +
    `[bg][v1][v2][v3][v4][v5]amix=inputs=6:duration=first:dropout_transition=2[aout]`;

  const args = [
    "-y",
    "-i", soundtrack,
    "-i", c1,
    "-i", c2,
    "-i", c3,
    "-i", c4,
    "-i", c5,
    "-filter_complex", filterComplex,
    "-map", "[aout]",
    "-c:a", "pcm_s16le",
    "-t", "60.0",
    outWav
  ];

  console.log("Mixing master horror soundtrack and boy narrator commentary...");
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) {
        console.log("Successfully produced master audio track:", outWav);
        resolve(outWav);
      } else {
        reject(new Error(`FFmpeg audio mix failed with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

mixAudio().catch((err) => {
  console.error("Audio mix failed:", err);
  process.exit(1);
});

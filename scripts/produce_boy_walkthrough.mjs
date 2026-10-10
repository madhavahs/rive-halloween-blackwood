import { spawn } from "child_process";
import path from "path";
import fs from "fs";

async function produceFinalVideo() {
  const gameplayVideo = path.resolve("recordings/blackwood-raw.webm");
  const avatarVideo = path.resolve("recordings/avatar.webm");
  const masterAudio = path.resolve("recordings/master_audio.wav");
  const subtitles = path.resolve("recordings/subtitles.ass");
  const outputMp4 = path.resolve("recordings/blackwood-halloween-walkthrough.mp4");

  if (!fs.existsSync(gameplayVideo)) throw new Error("Gameplay video missing");
  if (!fs.existsSync(avatarVideo)) throw new Error("Avatar video missing");
  if (!fs.existsSync(masterAudio)) throw new Error("Master audio missing");
  if (!fs.existsSync(subtitles)) throw new Error("Subtitles missing");

  const escapedSubPath = subtitles.replace(/\\/g, "/").replace(/:/g, "\\:");

  // Filter graph:
  // 1. Time-adjust gameplay: setpts=0.83*PTS
  // 2. Overlay avatar at x=985, y=245 (safe area below radar, above buttons)
  // 3. Burn in ASS subtitles
  const filterGraph = 
    `[0:v]setpts=0.83*PTS[bg];` +
    `[1:v]setpts=PTS[pip];` +
    `[bg][pip]overlay=x=985:y=245[v_pip];` +
    `[v_pip]ass='${escapedSubPath}'[v_out]`;

  const args = [
    "-y",
    "-i", gameplayVideo,
    "-i", avatarVideo,
    "-i", masterAudio,
    "-filter_complex", filterGraph,
    "-map", "[v_out]",
    "-map", "2:a",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-t", "59.8",
    "-movflags", "+faststart",
    outputMp4
  ];

  console.log("Composing video with animated boy avatar, speech commentary, and horror soundtrack...");
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) {
        console.log("Master video with boy explanation successfully generated:", outputMp4);
        resolve(outputMp4);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

produceFinalVideo().catch((err) => {
  console.error("Video production failed:", err);
  process.exit(1);
});

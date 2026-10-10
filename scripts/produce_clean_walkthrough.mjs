import { spawn } from "child_process";
import path from "path";
import fs from "fs";

async function produceCleanVideo() {
  const gameplayVideo = path.resolve("recordings/blackwood-raw.webm");
  const masterAudio = path.resolve("recordings/master_audio.wav");
  const outputMp4 = path.resolve("recordings/blackwood-halloween-walkthrough.mp4");

  if (!fs.existsSync(gameplayVideo)) throw new Error("Gameplay video missing");
  if (!fs.existsSync(masterAudio)) throw new Error("Master audio missing");

  // Raw duration is 85.92s -> speed to 59.8s (setpts = 59.8 / 85.92 = 0.696)
  const filterGraph = `setpts=0.696*PTS`;

  const args = [
    "-y",
    "-i", gameplayVideo,
    "-i", masterAudio,
    "-filter:v", filterGraph,
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

  console.log("Composing clean video with cursor movement, click highlights, command subtitles, and voiceover...");
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) {
        console.log("Clean master MP4 successfully generated:", outputMp4);
        resolve(outputMp4);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

produceCleanVideo().catch((err) => {
  console.error("Video production failed:", err);
  process.exit(1);
});

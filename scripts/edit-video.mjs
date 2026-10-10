import { spawn } from "child_process";
import path from "path";
import fs from "fs";

async function editVideo() {
  const rawVideo = path.resolve("recordings/blackwood-raw.webm");
  const soundtrack = path.resolve("recordings/soundtrack.wav");
  const subtitles = path.resolve("recordings/subtitles.ass");
  const outputMp4 = path.resolve("recordings/blackwood-halloween-walkthrough.mp4");

  if (!fs.existsSync(rawVideo)) {
    throw new Error(`Raw video not found: ${rawVideo}`);
  }
  if (!fs.existsSync(soundtrack)) {
    throw new Error(`Soundtrack not found: ${soundtrack}`);
  }
  if (!fs.existsSync(subtitles)) {
    throw new Error(`Subtitles not found: ${subtitles}`);
  }

  // Escape subtitle path for ffmpeg filter syntax
  const escapedSubPath = subtitles.replace(/\\/g, "/").replace(/:/g, "\\:");

  // Video filter: adjust PTS to speed up slightly to 59.5s, burn in ASS subtitles
  const vf = `setpts=0.83*PTS,ass='${escapedSubPath}'`;

  const args = [
    "-y",
    "-i", rawVideo,
    "-i", soundtrack,
    "-vf", vf,
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-t", "59.8",
    "-movflags", "+faststart",
    outputMp4,
  ];

  console.log("Running FFmpeg video processing...");
  console.log("FFmpeg command:", "ffmpeg", args.join(" "));

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) {
        console.log("Successfully produced final edited video:", outputMp4);
        resolve(outputMp4);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

editVideo().catch((err) => {
  console.error("Video editing failed:", err);
  process.exit(1);
});

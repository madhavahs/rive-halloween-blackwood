import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "../apps/web/dist");

console.log("=========================================");
console.log("BLACKWOOD PRODUCTION ASSET BUDGET AUDIT");
console.log("=========================================");

if (!fs.existsSync(DIST_DIR)) {
  console.error(`ERROR: Dist directory not found at ${DIST_DIR}. Run npm run build first.`);
  process.exit(1);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

const files = getAllFiles(DIST_DIR);
let totalBytes = 0;
let totalGzipBytes = 0;
let jsGzipBytes = 0;
let rivFound = false;
let htmlFound = false;

console.log("\nAssets found in dist:");

for (const filePath of files) {
  const relPath = path.relative(DIST_DIR, filePath).replace(/\\/g, "/");
  const buffer = fs.readFileSync(filePath);
  const size = buffer.length;
  const gzipSize = zlib.gzipSync(buffer).length;

  totalBytes += size;
  totalGzipBytes += gzipSize;

  if (relPath.endsWith(".js")) {
    jsGzipBytes += gzipSize;
  }
  if (relPath.endsWith(".riv")) {
    rivFound = true;
  }
  if (relPath === "index.html") {
    htmlFound = true;
  }

  const kb = (size / 1024).toFixed(2);
  const gzipKb = (gzipSize / 1024).toFixed(2);
  console.log(`  - ${relPath.padEnd(35)} ${kb.padStart(8)} KB (gzip: ${gzipKb.padStart(6)} KB)`);
}

const totalMb = (totalBytes / (1024 * 1024)).toFixed(3);
const totalGzipMb = (totalGzipBytes / (1024 * 1024)).toFixed(3);
const jsGzipKb = (jsGzipBytes / 1024).toFixed(2);

console.log("\n-----------------------------------------");
console.log(`Total Uncompressed Size : ${totalMb} MB (Budget: < 2.000 MB)`);
console.log(`Total Gzip Size         : ${totalGzipMb} MB (Budget: < 0.500 MB)`);
console.log(`JavaScript Gzip Size    : ${jsGzipKb} KB (Budget: < 350.00 KB)`);
console.log("-----------------------------------------");

// Assertions
const errors = [];

if (!htmlFound) {
  errors.push("CRITICAL: dist/index.html was not generated.");
}
if (!rivFound) {
  errors.push("CRITICAL: dist/rive/*.riv asset was not found in the build output.");
}
if (totalBytes > 2 * 1024 * 1024) {
  errors.push(`BUDGET EXCEEDED: Total size ${totalMb} MB exceeds 2.0 MB budget.`);
}
if (jsGzipBytes > 350 * 1024) {
  errors.push(`BUDGET EXCEEDED: JS gzip size ${jsGzipKb} KB exceeds 350 KB budget.`);
}

if (errors.length > 0) {
  console.error("\nAsset budget audit FAILED:");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log("\nAsset budget audit PASSED. Build is production ready.\n");
  process.exit(0);
}

# BLACKWOOD: Deployment Specification

## 1. Target Hosting & Environment
- **Platform:** Static Single-Page Application (SPA) deployable to Cloudflare Pages or Vercel.
- **Protocol:** HTTPS with HTTP/2+ support for fast parallel asset delivery.
- **Node Runtime (Build):** Node.js 20+ (built and validated on Node 24.14).

## 2. Build Pipeline
```bash
npm run build -w apps/web
```
- Outputs static bundle into `apps/web/dist/`.
- Verifies TypeScript compilation with `tsc --noEmit`.
- Bundles JavaScript, CSS, and static assets via Vite with es2022 target.
- Verifies `.riv` binary assets and shader files are located in `dist/` or `dist/public/`.

## 3. Asset Budgets & Performance SLA
| Asset Category | Target Budget | Compression / Format |
|----------------|---------------|----------------------|
| JavaScript (gzipped) | < 120 KB | Minified + Terser / esbuild |
| Rive `.riv` Binary | < 350 KB | Optimized Rive runtime format |
| Audio Sprites/Files | < 1.2 MB | OGG Vorbis / MP3 compressed |
| WGSL Shaders | < 25 KB | Plain text / inlined |
| **Total Initial Load** | **< 2.0 MB** | Full interactive in < 1.5s on 4G |

## 4. Cross-Platform Fallbacks
- **WebGPU / GPU Canvas:** If `navigator.gpu` or WGSL execution is unavailable in user's browser, graceful degradation applies:
  - Flashlight operates via 2D Canvas radial gradient mask (`ctx.globalCompositeOperation = "destination-out"`).
  - Scanlines and noise operate via CSS blend modes.
- **Audio Autoplay Policy:** Audio context remains suspended until the user interacts with the terminal (click / tap to start), complying with browser autoplay restrictions.

## 5. Verification Gate for Deployment (M11)
- `npm run typecheck` passes with zero warnings.
- `npm run lint` passes with `--max-warnings 0`.
- Vitest unit tests pass 100%.
- Playwright E2E passes across desktop and mobile viewports.
- No console errors (`console.error` / unhandled rejections) in production bundle.

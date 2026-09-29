#!/usr/bin/env node
// Re-encodes the homepage hero videos with fixed ffmpeg/x264 settings (two-pass, no audio, fast start).
//
//   node scripts/encode-homepage-hero-video.mjs --desktop-source <file> --mobile-source <file> [--out-dir <dir>]
//
// Best source: the client master `Lark20260611-213730.mp4` (74MB, not committed). When it is not
// available, pass the previously committed MP4s (for example extracted with
// `git show <sha>:public/media/launch/home/urblo-hero.mp4 > /tmp/desktop-source.mp4`); record which
// source was used in docs/WORKLOG.md. Requires ffmpeg with libx264 on PATH. Output defaults to
// public/media/launch/home/; `npm run agent:homepage-video` then checks the mobile compatibility
// contract and both delivery budgets.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const option = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}
const desktopSource = option('--desktop-source')
const mobileSource = option('--mobile-source')
const outDir = option('--out-dir') ?? 'public/media/launch/home'
if (!desktopSource || !mobileSource) {
  console.error('Usage: node scripts/encode-homepage-hero-video.mjs --desktop-source <file> --mobile-source <file> [--out-dir <dir>]')
  process.exit(2)
}

// Budgets: desktop <= 3MB, mobile <= 2MB for the 27s loop (bitrates leave ~8% container/rate headroom).
const TARGETS = [
  {
    name: 'desktop',
    source: desktopSource,
    output: join(outDir, 'urblo-hero.mp4'),
    budget: 3 * 1024 * 1024,
    // 1280x720 H.264 Main level 3.1: plays on every browser that plays the current file.
    video: ['-vf', 'scale=1280:720:flags=lanczos,fps=30', '-profile:v', 'main', '-level:v', '3.1', '-b:v', '820k', '-maxrate', '1400k', '-bufsize', '2800k', '-bf', '3', '-refs', '4'],
  },
  {
    name: 'mobile',
    source: mobileSource,
    output: join(outDir, 'urblo-hero-mobile.mp4'),
    budget: 2 * 1024 * 1024,
    // 540x960 Constrained Baseline level 3.1 for WeChat/X5 and older mobile decoders (see agent:homepage-video).
    video: ['-vf', 'scale=540:960:flags=lanczos,fps=30', '-profile:v', 'baseline', '-level:v', '3.1', '-b:v', '540k', '-maxrate', '900k', '-bufsize', '1800k'],
  },
]

const common = ['-hide_banner', '-loglevel', 'error', '-y']
const x264 = ['-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'film', '-pix_fmt', 'yuv420p', '-g', '60', '-threads', '1', '-an', '-map_metadata', '-1']
const workDir = mkdtempSync(join(tmpdir(), 'urblo-hero-'))
try {
  for (const target of TARGETS) {
    const passlog = join(workDir, target.name)
    const base = ['-i', target.source, ...x264, ...target.video, '-passlogfile', passlog]
    execFileSync('ffmpeg', [...common, ...base, '-pass', '1', '-f', 'mp4', '/dev/null'], { stdio: 'inherit' })
    execFileSync('ffmpeg', [...common, ...base, '-pass', '2', '-movflags', '+faststart', '-fflags', '+bitexact', '-flags:v', '+bitexact', target.output], { stdio: 'inherit' })
    const bytes = statSync(target.output).size
    console.log(`${target.name}: ${target.output} ${(bytes / 1048576).toFixed(2)}MB (budget ${(target.budget / 1048576).toFixed(0)}MB)`)
    if (bytes > target.budget) throw new Error(`${target.name} hero video exceeds its budget`)
  }
} finally {
  rmSync(workDir, { recursive: true, force: true })
}

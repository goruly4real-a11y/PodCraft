import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// ── PNG ENCODER (pure Node, no deps) ──────────────────────────────────────
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}
function createPngBuffer(width, height, renderPixel) {
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      const px = rowOffset + 1 + x * 4;
      raw[px] = r; raw[px + 1] = g; raw[px + 2] = b; raw[px + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; ihdrData[9] = 6;
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── PALETTE ────────────────────────────────────────────────────────────────
const STUDIO = [11, 15, 25];
const SIGNAL = [245, 158, 11];
const WAVE = [99, 102, 241];
const PAPER = [241, 245, 249];

const blend = (base, target, f) => [
  base[0] * (1 - f) + target[0] * f,
  base[1] * (1 - f) + target[1] * f,
  base[2] * (1 - f) + target[2] * f,
];

// ── RENDERER: "Resonant Form" ──────────────────────────────────────────────
// opts.showCropMarks: include corner registration marks (omit for maskable)
// opts.padScale: extra inward scaling for maskable safe zone (80% circle)
function renderResonantForm(x, y, w, h, opts = {}) {
  const { showCropMarks = true, padScale = 1 } = opts;

  // Work in normalized coords centered on canvas, scaled inward if padded
  const cx = w / 2;
  const cy = h / 2 - h * 0.02 * padScale;
  const nx = cx + (x - cx) / padScale;
  const ny = cy + (y - cy) / padScale;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  let col = [...STUDIO];

  // 1. Ambient radial glow (amber core → indigo fringe)
  const maxR = w * 0.45 / padScale;
  if (dist < maxR) {
    const t = 1 - dist / maxR;
    col[0] += 245 * 0.10 * t * t;
    col[1] += 158 * 0.07 * t * t;
    col[2] += (11 + 230) * 0.06 * t * t; // warm→violet warmth
  }

  // 2. Upper radiating arcs: amber core → indigo edge
  if (dy <= 0) {
    const arcCount = 10;
    const innerR = w * 0.085 / padScale;
    const outerR = w * 0.36 / padScale;
    for (let i = 0; i < arcCount; i++) {
      const p = i / (arcCount - 1);
      const targetR = innerR + (outerR - innerR) * p;
      const dArc = Math.abs(dist - targetR);
      const thick = (w * 0.0035 + (1 - p) * w * 0.003) / padScale;
      if (dArc < thick) {
        const intensity = 1 - dArc / thick;
        const f = (0.85 - p * 0.55) * intensity;
        col = blend(col, blend(SIGNAL, WAVE, p * 0.75), f);
      }
    }
  }

  // 3. Lower reflection arcs (indigo whisper)
  if (dy > 0) {
    const lowerArcs = 5;
    const innerR = w * 0.085 / padScale;
    const outerR = w * 0.24 / padScale;
    for (let i = 0; i < lowerArcs; i++) {
      const p = i / (lowerArcs - 1);
      const targetR = innerR + (outerR - innerR) * p;
      const dArc = Math.abs(dist - targetR);
      const thick = w * 0.0028 / padScale;
      if (dArc < thick) {
        const f = (0.28 - p * 0.16) * (1 - dArc / thick);
        col = blend(col, WAVE, f);
      }
    }
  }

  // 4. Waveform pair across centerline
  const waveW = w * 0.42 / padScale;
  if (nx >= cx - waveW && nx <= cx + waveW) {
    const t = (nx - (cx - waveW)) / (waveW * 2);
    const env = Math.sin(t * Math.PI);
    // Primary amber wave
    const y1 = cy + (Math.sin(t * Math.PI * 8) * 0.6 + Math.sin(t * Math.PI * 14) * 0.3 + Math.sin(t * Math.PI * 22) * 0.15) * w * 0.062 * env / padScale;
    const d1 = Math.abs(ny - y1);
    const t1 = w * 0.0052 / padScale;
    if (d1 < t1) col = blend(col, SIGNAL, (1 - d1 / t1) * 0.95);
    // Ghost indigo echo
    const y2 = cy + w * 0.011 / padScale + (Math.sin(t * Math.PI * 8 + 0.5) * 0.55 + Math.sin(t * Math.PI * 14 + 0.3) * 0.25) * w * 0.052 * env / padScale;
    const d2 = Math.abs(ny - y2);
    const t2 = w * 0.0034 / padScale;
    if (d2 < t2) col = blend(col, WAVE, (1 - d2 / t2) * 0.45);
  }

  // 5. Central node: glow halo, dark pupil, thin ring
  const nodeGlowR = w * 0.034 / padScale;
  if (dist < nodeGlowR) {
    const t = 1 - dist / nodeGlowR;
    col = blend(col, SIGNAL, t * t * 0.85);
  }
  const pupilR = w * 0.0135 / padScale;
  if (dist < pupilR) col = [...STUDIO];
  const ringD = Math.abs(dist - pupilR);
  const ringT = w * 0.0024 / padScale;
  if (ringD < ringT) col = blend(col, SIGNAL, (1 - ringD / ringT) * 0.95);

  // 6. Corner registration marks (skipped when masked shapes will crop them)
  if (showCropMarks) {
    const m = w * 0.055;
    const L = w * 0.024;
    const T = w * 0.0022;
    const nearV = (xx) => Math.abs(nx - xx) < T;
    const nearH = (yy) => Math.abs(ny - yy) < T;
    const hit =
      (nearV(m) && ny >= m && ny <= m + L) || (nearH(m) && nx >= m && nx <= m + L) ||
      (nearV(w - m) && ny >= m && ny <= m + L) || (nearH(m) && nx >= w - m - L && nx <= w - m) ||
      (nearV(m) && ny >= h - m - L && ny <= h - m) || (nearH(h - m) && nx >= m && nx <= m + L) ||
      (nearV(w - m) && ny >= h - m - L && ny <= h - m) || (nearH(h - m) && nx >= w - m - L && nx <= w - m);
    if (hit) col = blend(col, SIGNAL, 0.35);
  }

  return [Math.round(Math.min(255, col[0])), Math.round(Math.min(255, col[1])), Math.round(Math.min(255, col[2])), 255];
}

// ── GENERATE ALL SIZES ─────────────────────────────────────────────────────
const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const jobs = [
  ['icon-512.png', 512, { showCropMarks: true }],
  ['icon-192.png', 192, { showCropMarks: true }],
  ['icon-180.png', 180, { showCropMarks: false }],           // apple-touch-icon (iOS rounds corners itself)
  ['icon-maskable-512.png', 512, { showCropMarks: false, padScale: 1.25 }], // 80% safe zone
  ['favicon.png', 32, { showCropMarks: false }],
];

for (const [name, size, opts] of jobs) {
  process.stdout.write(`Rendering ${name} (${size}x${size})... `);
  fs.writeFileSync(path.join(iconsDir, name), createPngBuffer(size, size, (x, y, w, h) => renderResonantForm(x, y, w, h, opts)));
  console.log('ok');
}

// Museum-piece master canvas, large format
console.log('Rendering resonant-form-master.png (2048)...');
fs.writeFileSync(path.resolve('resonant-form-master.png'), createPngBuffer(2048, 2048, (x, y, w, h) => renderResonantForm(x, y, w, h, { showCropMarks: true })));

console.log('Done.');

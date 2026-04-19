import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function spiralPath({ cx = 256, cy = 256, rStart = 152, rEnd = 14, turns = 2.4, samples = 96 } = {}) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const theta = t * turns * 2 * Math.PI;
    const r = rStart + (rEnd - rStart) * t;
    const x = cx + r * Math.sin(theta);
    const y = cy - r * Math.cos(theta);
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`;
  }
  return d;
}

function buildSVG({ bleed = true, frame = true, maskable = false } = {}) {
  const scale = maskable ? 0.78 : 1;
  const cx = 256, cy = 256;
  const spiral = spiralPath({
    cx, cy,
    rStart: 152 * scale,
    rEnd: 12 * scale,
    turns: 2.35,
    samples: 120,
  });
  const strokeW = 40 * scale;
  const frameInset = maskable ? 64 : 42;
  const frameRadius = maskable ? 58 : 54;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="32%" r="85%">
      <stop offset="0%" stop-color="#1f2a40"/>
      <stop offset="55%" stop-color="#0b1018"/>
      <stop offset="100%" stop-color="#04050a"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#ff9a33" stop-opacity="0.65"/>
      <stop offset="55%" stop-color="#ff6a00" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ff6a00" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="orange" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#ffe4a6"/>
      <stop offset="35%" stop-color="#ffb347"/>
      <stop offset="70%" stop-color="#ff7a1a"/>
      <stop offset="100%" stop-color="#d94400"/>
    </linearGradient>
    <linearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff9a33" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#ff6a00" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ff9a33" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
      <feOffset dx="0" dy="3" result="offsetblur"/>
      <feFlood flood-color="#000" flood-opacity="0.55"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="inner-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6"/>
      <feComposite in="SourceGraphic" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg)"/>

  <!-- Diagonal hash pattern evoking card back -->
  <g opacity="0.055" stroke="#ff8c1a" stroke-width="1.2" fill="none">
    <path d="M-40 120 L560 -480 M-40 200 L560 -400 M-40 280 L560 -320 M-40 360 L560 -240 M-40 440 L560 -160 M-40 520 L560 -80 M-40 600 L560 0 M-40 680 L560 80 M-40 760 L560 160 M-40 840 L560 240 M-40 920 L560 320 M-40 1000 L560 400 M-40 1080 L560 480"/>
  </g>

  <!-- Outer glow halo -->
  <circle cx="${cx}" cy="${cy}" r="${215 * scale}" fill="url(#glow)"/>

  ${frame ? `
  <!-- Card frame -->
  <rect x="${frameInset}" y="${frameInset}"
        width="${512 - frameInset * 2}" height="${512 - frameInset * 2}"
        rx="${frameRadius}" ry="${frameRadius}"
        fill="none" stroke="url(#frameGrad)" stroke-width="2.5"/>
  <rect x="${frameInset + 10}" y="${frameInset + 10}"
        width="${512 - (frameInset + 10) * 2}" height="${512 - (frameInset + 10) * 2}"
        rx="${frameRadius - 6}" ry="${frameRadius - 6}"
        fill="none" stroke="#ff8c1a" stroke-opacity="0.12" stroke-width="1"/>
  ` : ''}

  <!-- Konoha-inspired spiral -->
  <g filter="url(#shadow)">
    <path d="${spiral}"
          stroke="url(#orange)"
          stroke-width="${strokeW}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"/>
  </g>

  <!-- Center dot highlight -->
  <circle cx="${cx}" cy="${cy}" r="${6 * scale}" fill="#fff7e0" opacity="0.92"/>

  <!-- Shuriken-card corner accents (top-left, bottom-right) -->
  ${frame && !maskable ? `
  <g fill="#ff8c1a" opacity="0.75">
    <path d="M 80 96 L 92 96 L 86 108 Z M 80 96 L 80 108 L 68 102 Z"/>
    <path d="M 432 416 L 420 416 L 426 404 Z M 432 416 L 432 404 L 444 410 Z"/>
  </g>
  ` : ''}
</svg>`;
}

async function rasterize(svgBuffer, size, outPath) {
  const png = await sharp(svgBuffer, { density: 512 })
    .resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(outPath, png);
  return png;
}

// Build a Windows .ico file wrapping PNG frames (PNG-in-ICO).
// Accepts an array of { size, png: Buffer }.
function buildIco(frames) {
  const headerSize = 6;
  const entrySize = 16;
  const entries = frames.length;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);       // reserved
  header.writeUInt16LE(1, 2);       // type = icon
  header.writeUInt16LE(entries, 4); // image count
  const entryTable = Buffer.alloc(entrySize * entries);
  let offset = headerSize + entrySize * entries;
  const dataBuffers = [];
  for (let i = 0; i < entries; i++) {
    const { size, png } = frames[i];
    const eo = i * entrySize;
    entryTable.writeUInt8(size >= 256 ? 0 : size, eo + 0);  // width (0 = 256)
    entryTable.writeUInt8(size >= 256 ? 0 : size, eo + 1);  // height
    entryTable.writeUInt8(0, eo + 2);                        // palette
    entryTable.writeUInt8(0, eo + 3);                        // reserved
    entryTable.writeUInt16LE(1, eo + 4);                     // color planes
    entryTable.writeUInt16LE(32, eo + 6);                    // bpp
    entryTable.writeUInt32LE(png.length, eo + 8);            // size of PNG data
    entryTable.writeUInt32LE(offset, eo + 12);               // offset
    offset += png.length;
    dataBuffers.push(png);
  }
  return Buffer.concat([header, entryTable, ...dataBuffers]);
}

async function main() {
  const svgRegular = Buffer.from(buildSVG({ frame: true, maskable: false }));
  const svgMaskable = Buffer.from(buildSVG({ frame: false, maskable: true }));

  const appDir = join(root, 'src', 'app');
  const iconsDir = join(root, 'public', 'icons');
  await mkdir(iconsDir, { recursive: true });

  // Regular icon (auto-wired by Next.js)
  await rasterize(svgRegular, 512, join(appDir, 'icon.png'));

  // Small icon for browser tabs (Next auto-wires numbered icons too)
  await rasterize(svgRegular, 32, join(appDir, 'icon1.png'));

  // Apple touch icon (auto-wired by Next.js) — 180x180 recommended
  await rasterize(svgRegular, 180, join(appDir, 'apple-icon.png'));

  // favicon.ico with multi-size PNG frames (16, 32, 48)
  const fav16 = await sharp(svgRegular, { density: 512 }).resize(16, 16, { kernel: 'lanczos3' }).png().toBuffer();
  const fav32 = await sharp(svgRegular, { density: 512 }).resize(32, 32, { kernel: 'lanczos3' }).png().toBuffer();
  const fav48 = await sharp(svgRegular, { density: 512 }).resize(48, 48, { kernel: 'lanczos3' }).png().toBuffer();
  const ico = buildIco([
    { size: 16, png: fav16 },
    { size: 32, png: fav32 },
    { size: 48, png: fav48 },
  ]);
  await writeFile(join(appDir, 'favicon.ico'), ico);

  // Extra sizes for manifest references & fallback
  await rasterize(svgRegular, 192, join(iconsDir, 'icon-192.png'));
  await rasterize(svgRegular, 512, join(iconsDir, 'icon-512.png'));
  await rasterize(svgMaskable, 512, join(iconsDir, 'icon-maskable-512.png'));
  await rasterize(svgMaskable, 192, join(iconsDir, 'icon-maskable-192.png'));

  // Favicon — Next.js supports .ico at app/favicon.ico but sharp can't write ico directly;
  // a PNG at app/icon.png already covers favicon needs in modern browsers.
  // Also emit a 32px PNG copy for clarity.
  await rasterize(svgRegular, 32, join(iconsDir, 'favicon-32.png'));

  // Save source SVG for reference / inspection.
  await writeFile(join(iconsDir, 'icon-source.svg'), svgRegular);
  await writeFile(join(iconsDir, 'icon-maskable-source.svg'), svgMaskable);

  console.log('✓ Icons generated:');
  console.log('  src/app/icon.png (512x512)');
  console.log('  src/app/apple-icon.png (180x180)');
  console.log('  public/icons/icon-{192,512}.png');
  console.log('  public/icons/icon-maskable-{192,512}.png');
  console.log('  public/icons/favicon-32.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

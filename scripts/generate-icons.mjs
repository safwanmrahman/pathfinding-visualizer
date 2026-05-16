import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const publicDir = resolve('public');

const palette = {
  background: [247, 243, 236, 255],
  panel: [255, 253, 250, 255],
  grid: [207, 191, 170, 255],
  slate: [47, 60, 73, 255],
  start: [31, 122, 99, 255],
  target: [196, 76, 65, 255],
  path: [167, 88, 45, 255],
  white: [255, 255, 255, 255],
};

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(buffer) {
  let value = 0xffffffff;

  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuffer), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function pngBuffer(width, height, paint) {
  const pixels = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const [r, g, b, a] = paint(x, y, width, height);
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
      pixels[offset + 3] = a;
    }
  }

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rawOffset = y * (stride + 1);
    raw[rawOffset] = 0;
    Buffer.from(pixels.subarray(y * stride, (y + 1) * stride)).copy(raw, rawOffset + 1);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function icoBuffer(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const directory = Buffer.alloc(16);
  directory[0] = 32;
  directory[1] = 32;
  directory[2] = 0;
  directory[3] = 0;
  directory.writeUInt16LE(1, 4);
  directory.writeUInt16LE(32, 6);
  directory.writeUInt32LE(png.length, 8);
  directory.writeUInt32LE(header.length + directory.length, 12);

  return Buffer.concat([header, directory, png]);
}

function withinRoundedRect(x, y, width, height, radius) {
  const left = radius;
  const right = width - radius - 1;
  const top = radius;
  const bottom = height - radius - 1;

  if ((x >= left && x <= right) || (y >= top && y <= bottom)) {
    return true;
  }

  const cornerX = x < left ? left : right;
  const cornerY = y < top ? top : bottom;
  const dx = x - cornerX;
  const dy = y - cornerY;
  return dx * dx + dy * dy <= radius * radius;
}

function withinStrokeRoundedRect(x, y, width, height, radius, strokeWidth) {
  return (
    withinRoundedRect(x, y, width, height, radius) &&
    !withinRoundedRect(x, y, width, height, Math.max(0, radius - strokeWidth)) ||
    (withinRoundedRect(x, y, width, height, radius) &&
      !withinRoundedRect(
        x - strokeWidth,
        y - strokeWidth,
        width - strokeWidth * 2,
        height - strokeWidth * 2,
        Math.max(0, radius - strokeWidth),
      ))
  );
}

function drawPathGlyph(x, y, width, height) {
  const min = Math.min(width, height);
  const stroke = Math.max(2, Math.round(min * 0.1));
  const left = Math.round(width * 0.26);
  const midX = Math.round(width * 0.48);
  const right = Math.round(width * 0.72);
  const bottom = Math.round(height * 0.7);
  const midY = Math.round(height * 0.48);
  const top = Math.round(height * 0.28);
  const targetSize = Math.max(2, Math.round(min * 0.085));
  const startRadius = Math.max(2, Math.round(min * 0.1));
  const targetCenterX = right;
  const targetCenterY = top;
  const startCenterX = left;
  const startCenterY = bottom;

  const onVerticalLeft =
    Math.abs(x - left) <= stroke / 2 && y >= midY && y <= bottom;
  const onHorizontal =
    Math.abs(y - midY) <= stroke / 2 && x >= left && x <= midX;
  const onVerticalMid =
    Math.abs(x - midX) <= stroke / 2 && y >= top && y <= midY;
  const onHorizontalTop =
    Math.abs(y - top) <= stroke / 2 && x >= midX && x <= right;

  const startDx = x - startCenterX;
  const startDy = y - startCenterY;
  const inStart = startDx * startDx + startDy * startDy <= startRadius * startRadius;
  const ring = startDx * startDx + startDy * startDy <= (startRadius + 1) * (startRadius + 1);

  const diamondDistance = Math.abs(x - targetCenterX) + Math.abs(y - targetCenterY);
  const inTarget = diamondDistance <= targetSize;
  const targetBorder = diamondDistance <= targetSize + 1;

  if (inStart) {
    return palette.start;
  }

  if (targetBorder && !inTarget) {
    return palette.white;
  }

  if (inTarget) {
    return palette.target;
  }

  if (ring && !inStart) {
    return palette.white;
  }

  if (onVerticalLeft || onHorizontal || onVerticalMid || onHorizontalTop) {
    return palette.path;
  }

  return null;
}

function paintIcon(x, y, width, height) {
  const size = Math.min(width, height);
  const outerRadius = Math.round(size * 0.22);
  const innerInset = Math.max(2, Math.round(size * 0.11));
  const innerWidth = width - innerInset * 2;
  const innerHeight = height - innerInset * 2;
  const innerRadius = Math.round(size * 0.14);
  const border = Math.max(1, Math.round(size * 0.024));

  if (!withinRoundedRect(x, y, width, height, outerRadius)) {
    return [0, 0, 0, 0];
  }

  let color = palette.background;

  if (withinRoundedRect(x - innerInset, y - innerInset, innerWidth, innerHeight, innerRadius)) {
    color = palette.panel;

    const gridOffset = Math.max(3, Math.round(size * 0.13));
    const gridSpan = innerWidth - gridOffset * 2;
    const step = Math.max(4, Math.round(gridSpan / 3));
    const relX = x - innerInset;
    const relY = y - innerInset;
    const onGrid =
      relX >= gridOffset &&
      relX <= innerWidth - gridOffset &&
      relY >= gridOffset &&
      relY <= innerHeight - gridOffset &&
      ((Math.abs((relX - gridOffset) % step) <= 0.5 && relY >= gridOffset && relY <= innerHeight - gridOffset) ||
        (Math.abs((relY - gridOffset) % step) <= 0.5 && relX >= gridOffset && relX <= innerWidth - gridOffset));

    if (onGrid) {
      color = palette.grid;
    }
  }

  if (
    withinRoundedRect(x - innerInset, y - innerInset, innerWidth, innerHeight, innerRadius) &&
    withinStrokeRoundedRect(x - innerInset, y - innerInset, innerWidth, innerHeight, innerRadius, border)
  ) {
    color = palette.slate;
  }

  const glyph = drawPathGlyph(x, y, width, height);
  return glyph ?? color;
}

function writeBinary(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title desc">
  <title id="title">Pathfinding Visualizer icon</title>
  <desc id="desc">A minimalist grid with a highlighted route from the start node to the target.</desc>
  <rect width="64" height="64" rx="14" fill="#f7f3ec" />
  <rect x="7" y="7" width="50" height="50" rx="9" fill="#fffdfa" stroke="#2f3c49" stroke-width="1.5" />
  <g stroke="#cfbfaa" stroke-width="1.25">
    <path d="M19 13v38" />
    <path d="M32 13v38" />
    <path d="M45 13v38" />
    <path d="M13 19h38" />
    <path d="M13 32h38" />
    <path d="M13 45h38" />
  </g>
  <path
    d="M17 45V32H31V19H46"
    fill="none"
    stroke="#a7582d"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="5"
  />
  <circle cx="17" cy="45" r="5" fill="#1f7a63" stroke="#fffdfa" stroke-width="2" />
  <path d="M46 13l6 6-6 6-6-6z" fill="#c44c41" stroke="#fffdfa" stroke-width="2" stroke-linejoin="round" />
</svg>
`;

writeBinary(resolve(publicDir, 'favicon.svg'), svg);

const sizes = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
];

let favicon32;

for (const [name, size] of sizes) {
  const png = pngBuffer(size, size, paintIcon);
  writeBinary(resolve(publicDir, name), png);

  if (size === 32) {
    favicon32 = png;
  }
}

writeBinary(resolve(publicDir, 'favicon.ico'), icoBuffer(favicon32));

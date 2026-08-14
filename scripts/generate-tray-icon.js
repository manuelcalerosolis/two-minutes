const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const width = 32;
const height = 32;
const pixels = Buffer.alloc((width * 4 + 1) * height);

function setPixel(x, y, [r, g, b, a]) {
  const offset = y * (width * 4 + 1) + 1 + x * 4;
  pixels[offset] = r;
  pixels[offset + 1] = g;
  pixels[offset + 2] = b;
  pixels[offset + 3] = a;
}

for (let y = 0; y < height; y++) {
  pixels[y * (width * 4 + 1)] = 0;
  for (let x = 0; x < width; x++) {
    const dx = Math.max(7 - x, 0, x - 24);
    const dy = Math.max(7 - y, 0, y - 24);
    const inside = dx * dx + dy * dy <= 25;
    setPixel(x, y, inside ? [220, 255, 99, 255] : [0, 0, 0, 0]);
  }
}

const glyph = [
  '011110',
  '110011',
  '000011',
  '000110',
  '001100',
  '011000',
  '110000',
  '111111'
];
for (let row = 0; row < glyph.length; row++) {
  for (let col = 0; col < glyph[row].length; col++) {
    if (glyph[row][col] === '1') {
      for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) {
        setPixel(10 + col * 2 + xx, 8 + row * 2 + yy, [21, 23, 19, 255]);
      }
    }
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(data) {
  let c = 0xffffffff;
  for (const byte of data) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header),
  chunk('IDAT', zlib.deflateSync(pixels)),
  chunk('IEND', Buffer.alloc(0))
]);

fs.writeFileSync(path.join(__dirname, '..', 'src', 'assets', 'tray.png'), png);

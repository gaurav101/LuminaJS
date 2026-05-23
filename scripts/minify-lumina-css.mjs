/* global Buffer, console, process */

import fs from 'node:fs';
import path from 'node:path';
import { transform } from 'lightningcss';

const sourcePath = path.resolve('dist/lumina-image.css');

if (!fs.existsSync(sourcePath)) {
  console.error(`CSS minify failed: file not found at ${sourcePath}`);
  process.exit(1);
}

const source = fs.readFileSync(sourcePath, 'utf8');
const beforeBytes = Buffer.byteLength(source, 'utf8');

const { code } = transform({
  filename: sourcePath,
  code: Buffer.from(source),
  minify: true,
});

const minified = Buffer.from(code).toString('utf8');
const afterBytes = Buffer.byteLength(minified, 'utf8');
const savedBytes = beforeBytes - afterBytes;
const savedPercent = ((savedBytes / beforeBytes) * 100).toFixed(2);

fs.writeFileSync(sourcePath, `${minified}\n`, 'utf8');

console.log(
  `Minified dist/lumina-image.css (${beforeBytes} -> ${afterBytes} bytes, saved ${savedBytes} bytes, ${savedPercent}%)`,
);

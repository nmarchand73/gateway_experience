import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const distMedia = path.join(root, 'dist', 'media');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`copy-media: source missing ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(path.join(root, 'dist'))) {
  console.warn('copy-media: dist/ not found — run astro build first');
  process.exit(0);
}

if (process.env.SKIP_COPY_MEDIA === '1') {
  console.log('copy-media: SKIP_COPY_MEDIA=1 — skipping (CI / code-only deploy)');
  process.exit(0);
}

if (!fs.existsSync(dataDir)) {
  console.warn('copy-media: data/ missing — skipping (pages deploy without local media)');
  process.exit(0);
}

console.log(`Copying ${dataDir} → ${distMedia} …`);
const t0 = Date.now();
copyRecursive(dataDir, distMedia);
console.log(`copy-media done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

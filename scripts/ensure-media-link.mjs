import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const publicDir = path.join(root, 'public');
const linkPath = path.join(publicDir, 'media');

if (!fs.existsSync(dataDir)) {
  console.warn('ensure-media-link: data/ missing — audio will 404 until media is present');
  process.exit(0);
}

fs.mkdirSync(publicDir, { recursive: true });

if (fs.existsSync(linkPath)) {
  const stat = fs.lstatSync(linkPath);
  if (stat.isSymbolicLink()) {
    const target = fs.readlinkSync(linkPath);
    const resolved = path.resolve(publicDir, target);
    if (path.resolve(resolved) === path.resolve(dataDir)) {
      process.exit(0);
    }
    fs.rmSync(linkPath, { recursive: true, force: true });
  } else if (stat.isDirectory()) {
    console.warn('ensure-media-link: public/media exists as a real folder — remove it to use data/ symlink');
    process.exit(0);
  }
}

const linkTarget = path.relative(publicDir, dataDir);
try {
  fs.symlinkSync(linkTarget, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
  console.log(`ensure-media-link: public/media → ${linkTarget}`);
} catch (err) {
  console.error('ensure-media-link: failed to create symlink/junction:', err.message);
  console.error('On Windows, run the terminal as Administrator or enable Developer Mode for symlinks.');
  process.exit(1);
}

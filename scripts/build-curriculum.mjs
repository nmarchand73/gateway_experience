import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'data', 'manifest.json');
const outPath = path.join(root, 'content', 'curriculum.json');

const WAVE_META = {
  'wave-i': {
    roman: 'I',
    slug: 'wave-i',
    focusLevel: 10,
    title: { en: 'Discovery', fr: 'Découverte' },
    beatHz: 10,
    bandLabel: { en: 'Alpha/Theta', fr: 'Alpha/Thêta' },
  },
  'wave-ii': {
    roman: 'II',
    slug: 'wave-ii',
    focusLevel: 12,
    title: { en: 'Threshold', fr: 'Seuil' },
    beatHz: 12,
    bandLabel: { en: 'Theta', fr: 'Thêta' },
  },
  'wave-iii': {
    roman: 'III',
    slug: 'wave-iii',
    focusLevel: 12,
    title: { en: 'Freedom', fr: 'Liberté' },
    beatHz: 12,
    bandLabel: { en: 'Theta', fr: 'Thêta' },
  },
  'wave-iv': {
    roman: 'IV',
    slug: 'wave-iv',
    focusLevel: 15,
    title: { en: 'Adventure', fr: 'Aventure' },
    beatHz: 15,
    bandLabel: { en: 'Beta/Alpha', fr: 'Beta/Alpha' },
  },
  'wave-v': {
    roman: 'V',
    slug: 'wave-v',
    focusLevel: 15,
    title: { en: 'Exploring Focus 15', fr: 'Exploration Focus 15' },
    beatHz: 15,
    bandLabel: { en: 'Beta/Alpha', fr: 'Beta/Alpha' },
  },
  'wave-vi': {
    roman: 'VI',
    slug: 'wave-vi',
    focusLevel: 21,
    title: { en: 'Odyssey', fr: 'Odyssée' },
    beatHz: 21,
    bandLabel: { en: 'Beta', fr: 'Beta' },
  },
};

const WAVE_FOLDER_TO_SLUG = [
  [/Wave I - Discovery/i, 'wave-i'],
  [/Wave II - Threshold/i, 'wave-ii'],
  [/Wave III - Freedom/i, 'wave-iii'],
  [/Wave IV - Adventure/i, 'wave-iV'],
  [/Wave V - Exploring/i, 'wave-v'],
  [/Wave VI - Odyssey/i, 'wave-vi'],
];

function waveSlugFromPath(p) {
  for (const [re, slug] of WAVE_FOLDER_TO_SLUG) {
    if (re.test(p)) return slug === 'wave-iV' ? 'wave-iv' : slug;
  }
  return null;
}

function parseFlacSession(filePath, fileEntry) {
  const waveSlug = waveSlugFromPath(filePath);
  if (!waveSlug) return null;
  const base = path.basename(filePath, '.flac');
  const m = base.match(/CD\d+\s*-\s*(\d+)\s*-\s*(.+)/i);
  if (!m) return null;
  const index = parseInt(m[1], 10);
  const titleEn = m[2].trim();
  const meta = WAVE_META[waveSlug];
  const id = `${waveSlug}-${String(index).padStart(2, '0')}`;
  return {
    id,
    waveSlug,
    index,
    title: { en: titleEn, fr: titleEn },
    audio: { en: { path: filePath, sha256: fileEntry.sha256, format: 'flac' } },
    manualPdf: findWavePdf(waveSlug),
    frequencies: {
      focusLevel: meta.focusLevel,
      beatHz: meta.beatHz,
      leftHz: null,
      rightHz: null,
      bandLabel: meta.bandLabel,
      reviewed: false,
    },
  };
}

function findWavePdf(waveSlug) {
  const roman = WAVE_META[waveSlug].roman;
  const patterns = [
    `Wave ${roman}`,
    `Wave ${roman.toUpperCase()}`,
  ];
  return patterns;
}

const FR_WAVE_I = [
  { index: 1, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Découverte 01 - Orientation (focus 3) - Wave I.mp3', titleFr: 'Orientation (Focus 3)' },
  { index: 2, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Découverte 02 - Introduction (focus 10)Découverte 02 - Wave I.mp3', titleFr: 'Introduction (Focus 10)' },
  { index: 3, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Découverte 03 - Focus 10 avancé - Wave I.mp3', titleFr: 'Focus 10 avancé' },
  { index: 4, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Découverte 04 - Libération et Revitalisation - Wave I.mp3', titleFr: 'Libération et Revitalisation' },
  { index: 5, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Découverte 05 - Exploration , Sommeil - Wave I.mp3', titleFr: 'Exploration, Sommeil' },
  { index: 6, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Découverte 06 - Evolution Libre Focus 10 - Wave I.mp3', titleFr: 'Évolution libre Focus 10' },
];

const FR_WAVE_II = [
  { index: 1, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Seuil 07 Introduction a Focus 12 - Wave II.mp3', titleFr: 'Introduction à Focus 12' },
  { index: 2, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Seuil 08 - Résolution de Problèmes - Wave II.mp3', titleFr: 'Résolution de problèmes' },
  { index: 3, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Seuil 09 - Programation - Wave II.mp3', titleFr: 'Programmation' },
  { index: 4, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Seuil 10 - La Barre d\'Energie - Wave II.mp3', titleFr: "La barre d'énergie" },
  { index: 5, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Seuil 11 - La Carte Vivante - Wave II.mp3', titleFr: 'La carte vivante' },
  { index: 6, frPath: 'Hemi-Sync/Hemi-sync COURS 1/Seuil 12 - Evolution Libre 12 - Wave II.mp3', titleFr: 'Évolution libre 12' },
];

function fileByPath(files, relPath) {
  return files.find((f) => f.path.replace(/\\/g, '/') === relPath.replace(/\\/g, '/'));
}

function buildSupplements(files) {
  const mindFood = [];
  const humainPlus = [];
  for (const f of files) {
    const p = f.path.replace(/\\/g, '/');
    if (!/\.mp3$/i.test(p)) continue;
    if (/Mind Food/i.test(p)) {
      mindFood.push({
        id: slugify(path.basename(p, '.mp3')),
        title: { fr: path.basename(p, '.mp3'), en: path.basename(p, '.mp3') },
        audio: { path: p, sha256: f.sha256, format: 'mp3' },
        category: 'mind-food',
      });
    } else if (/Humain Plus/i.test(p)) {
      humainPlus.push({
        id: slugify(path.basename(p, '.mp3')),
        title: { fr: path.basename(p, '.mp3'), en: path.basename(p, '.mp3') },
        audio: { path: p, sha256: f.sha256, format: 'mp3' },
        category: 'humain-plus',
      });
    }
  }
  return { mindFood, humainPlus };
}

const V2_ROOT = 'Hemi-Sync Gateway Experience - v2';

const V2_WAVE_META = {
  'wave-i': {
    roman: 'I',
    slug: 'wave-i',
    focusLevel: 10,
    title: { en: 'Discovery', fr: 'Découverte' },
    beatHz: 10,
    bandLabel: { en: 'Alpha/Theta', fr: 'Alpha/Thêta' },
  },
  'wave-ii': {
    roman: 'II',
    slug: 'wave-ii',
    focusLevel: 12,
    title: { en: 'Threshold', fr: 'Seuil' },
    beatHz: 12,
    bandLabel: { en: 'Theta', fr: 'Thêta' },
  },
  'wave-iii': {
    roman: 'III',
    slug: 'wave-iii',
    focusLevel: 12,
    title: { en: 'Freedom', fr: 'Liberté' },
    beatHz: 12,
    bandLabel: { en: 'Theta', fr: 'Thêta' },
  },
  'wave-iv': {
    roman: 'IV',
    slug: 'wave-iv',
    focusLevel: 15,
    title: { en: 'Adventure', fr: 'Aventure' },
    beatHz: 15,
    bandLabel: { en: 'Beta/Alpha', fr: 'Beta/Alpha' },
  },
  'wave-v': {
    roman: 'V',
    slug: 'wave-v',
    focusLevel: 15,
    title: { en: 'Exploring Focus 15', fr: 'Exploration Focus 15' },
    beatHz: 15,
    bandLabel: { en: 'Beta/Alpha', fr: 'Beta/Alpha' },
  },
  'wave-vi': {
    roman: 'VI',
    slug: 'wave-vi',
    focusLevel: 21,
    title: { en: 'Prospecting', fr: 'Prospection' },
    beatHz: 21,
    bandLabel: { en: 'Beta', fr: 'Beta' },
  },
  'wave-vii': {
    roman: 'VII',
    slug: 'wave-vii',
    focusLevel: 21,
    title: { en: 'Odyssey', fr: 'Odyssée' },
    beatHz: 21,
    bandLabel: { en: 'Beta', fr: 'Beta' },
  },
};

const V2_FOLDER_TO_SLUG = [
  [/Wave I - Discovery/i, 'wave-i'],
  [/Wave II - Threshold/i, 'wave-ii'],
  [/Wave III - Freedom/i, 'wave-iii'],
  [/Wave IV - Adventure/i, 'wave-iv'],
  [/Wave V - Exploring/i, 'wave-v'],
  [/Wave VI - Prospecting/i, 'wave-vi'],
  [/Wave VII - Odyssey/i, 'wave-vii'],
];

function v2WaveSlugFromFolder(name) {
  for (const [re, slug] of V2_FOLDER_TO_SLUG) {
    if (re.test(name)) return slug;
  }
  return null;
}

function sha256File(absPath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(absPath));
  return hash.digest('hex');
}

function fileRef(files, relPath, absPath) {
  const entry = fileByPath(files, relPath);
  return {
    path: relPath.replace(/\\/g, '/'),
    sha256: entry?.sha256 ?? sha256File(absPath),
    format: path.extname(relPath).slice(1).toLowerCase(),
  };
}

function buildV2Edition(files, pdfByWave) {
  const v2Dir = path.join(root, 'data', V2_ROOT);
  if (!fs.existsSync(v2Dir)) return null;

  const sessions = [];
  for (const folder of fs.readdirSync(v2Dir)) {
    const waveSlug = v2WaveSlugFromFolder(folder);
    if (!waveSlug) continue;
    const waveDir = path.join(v2Dir, folder);
    if (!fs.statSync(waveDir).isDirectory()) continue;
    const meta = V2_WAVE_META[waveSlug];

    for (const file of fs.readdirSync(waveDir)) {
      if (!/\.mp3$/i.test(file)) continue;
      const m = file.match(/^(\d+)\s*-/);
      if (!m) continue;
      const index = parseInt(m[1], 10);
      const titleEn = file
        .replace(/^\d+\s*-\s*/, '')
        .replace(/\.mp3$/i, '')
        .trim();
      const relPath = `${V2_ROOT}/${folder}/${file}`.replace(/\\/g, '/');
      const absPath = path.join(waveDir, file);
      const id = `${waveSlug}-${String(index).padStart(2, '0')}`;
      sessions.push({
        id,
        waveSlug,
        index,
        title: { en: titleEn, fr: titleEn },
        audio: { en: fileRef(files, relPath, absPath) },
        manualPdf: null,
        frequencies: {
          focusLevel: meta.focusLevel,
          beatHz: meta.beatHz,
          leftHz: null,
          rightHz: null,
          bandLabel: meta.bandLabel,
          reviewed: false,
        },
      });
    }
  }

  sessions.sort((a, b) => {
    const order = Object.keys(V2_WAVE_META);
    return order.indexOf(a.waveSlug) - order.indexOf(b.waveSlug) || a.index - b.index;
  });

  const v2PdfByWave = {
    'wave-i': pdfByWave['wave-i'],
    'wave-ii': pdfByWave['wave-ii'],
    'wave-iii': pdfByWave['wave-iii'],
    'wave-iv': pdfByWave['wave-iv'],
    'wave-v': pdfByWave['wave-v'],
    'wave-vi': pdfByWave['wave-v'],
    'wave-vii': pdfByWave['wave-vi'],
  };

  for (const session of sessions) {
    session.manualPdf = v2PdfByWave[session.waveSlug] || null;
  }

  const waves = Object.values(V2_WAVE_META).map((meta) => ({
    ...meta,
    manualPdf: v2PdfByWave[meta.slug] || null,
    sessions: sessions.filter((s) => s.waveSlug === meta.slug).map((s) => s.id),
  }));

  return {
    id: 'v2',
    label: {
      en: 'Gateway Experience v2 (MP3)',
      fr: 'Gateway Experience v2 (MP3)',
    },
    description: {
      en: 'Seven-wave English MP3 release — includes Prospecting (VI) and Odyssey (VII).',
      fr: 'Parcours anglais en MP3, sept vagues — inclut Prospection (VI) et Odyssée (VII).',
    },
    audioLang: 'en',
    waves,
    sessions,
  };
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const rawManifest = fs.readFileSync(manifestPath, 'utf-8').replace(/^\uFEFF/, '');
const manifest = JSON.parse(rawManifest);
const files = manifest.files;

const pdfByWave = {};
for (const f of files) {
  const p = f.path.replace(/\\/g, '/');
  if (!/Gateway Experience.*Wave [IVX]+.*\.pdf$/i.test(p) && !/Wave [IVX]+ - .*\.pdf$/i.test(p)) continue;
  const slug = waveSlugFromPath(p);
  if (slug && !pdfByWave[slug]) pdfByWave[slug] = p;
}

const sessions = [];
for (const f of files) {
  if (!/\.flac$/i.test(f.path)) continue;
  const session = parseFlacSession(f.path.replace(/\\/g, '/'), f);
  if (session) {
    session.manualPdf = pdfByWave[session.waveSlug] || null;
    sessions.push(session);
  }
}

sessions.sort((a, b) => {
  const wa = Object.keys(WAVE_META).indexOf(a.waveSlug);
  const wb = Object.keys(WAVE_META).indexOf(b.waveSlug);
  return wa - wb || a.index - b.index;
});

for (const map of [FR_WAVE_I, FR_WAVE_II]) {
  for (const fr of map) {
    const waveSlug = map === FR_WAVE_I ? 'wave-i' : 'wave-ii';
    const id = `${waveSlug}-${String(fr.index).padStart(2, '0')}`;
    const session = sessions.find((s) => s.id === id);
    const fileEntry = fileByPath(files, fr.frPath);
    if (session && fileEntry) {
      session.title.fr = fr.titleFr;
      session.audio.fr = { path: fr.frPath, sha256: fileEntry.sha256, format: 'mp3' };
    }
  }
}

const waves = Object.values(WAVE_META).map((meta) => ({
  ...meta,
  manualPdf: pdfByWave[meta.slug] || null,
  sessions: sessions.filter((s) => s.waveSlug === meta.slug).map((s) => s.id),
}));

const supplements = buildSupplements(files);

const glossary = [
  { focus: 3, title: { en: 'Focus 3', fr: 'Focus 3' }, desc: { en: 'Orientation state — entry to expanded awareness.', fr: 'État d\'orientation — entrée dans la conscience élargie.' } },
  { focus: 10, title: { en: 'Focus 10', fr: 'Focus 10' }, desc: { en: 'Mind awake, body asleep. Gateway foundation state.', fr: 'Esprit éveillé, corps endormi. État fondamental du Gateway.' } },
  { focus: 12, title: { en: 'Focus 12', fr: 'Focus 12' }, desc: { en: 'Expanded awareness — access to non-physical information.', fr: 'Conscience élargie — accès à l\'information non physique.' } },
  { focus: 15, title: { en: 'Focus 15', fr: 'Focus 15' }, desc: { en: 'State of no time — creation and manifestation.', fr: 'État hors du temps — création et manifestation.' } },
  { focus: 21, title: { en: 'Focus 21', fr: 'Focus 21' }, desc: { en: 'Other energy systems — edge of human consciousness.', fr: 'Autres systèmes d\'énergie — limite de la conscience humaine.' } },
];

const classicEdition = {
  id: 'classic',
  label: {
    en: 'Classic release (FLAC)',
    fr: 'Version classique (FLAC)',
  },
  description: {
    en: 'Original six-wave FLAC set; Waves I–II also available in French MP3.',
    fr: 'Six vagues en FLAC ; vagues I–II aussi en MP3 français.',
  },
  audioLang: 'mixed',
  waves,
  sessions,
};

const v2Edition = buildV2Edition(files, pdfByWave);

const editions = { classic: classicEdition };
if (v2Edition) editions.v2 = v2Edition;

const curriculum = {
  generatedAt: new Date().toISOString(),
  sourceManifest: 'data/manifest.json',
  defaultEdition: 'classic',
  editions,
  waves,
  sessions,
  supplements,
  glossary,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(curriculum, null, 2));
const v2Count = v2Edition?.sessions.length ?? 0;
console.log(
  `Wrote ${outPath} — classic ${sessions.length} sessions, v2 ${v2Count} sessions, ${supplements.mindFood.length + supplements.humainPlus.length} supplements`,
);

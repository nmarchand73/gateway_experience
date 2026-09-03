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
    // EEG bands: Monroe Institute UK (delta 1–4, theta 4–8, alpha 8–13, beta 13–30, gamma 30–150).
    // Focus N is a state label, not “N hertz”. beatHz is an unverified |L−R| placeholder.
    bandLabel: { en: 'α 8–13 Hz (often + θ 4–8)', fr: 'α 8–13 Hz (souvent + θ 4–8)' },
  },
  'wave-ii': {
    roman: 'II',
    slug: 'wave-ii',
    focusLevel: 12,
    title: { en: 'Threshold', fr: 'Seuil' },
    beatHz: 12,
    bandLabel: { en: 'α 8–13 Hz (12 Hz is alpha, not theta)', fr: 'α 8–13 Hz (12 Hz = alpha, pas thêta)' },
  },
  'wave-iii': {
    roman: 'III',
    slug: 'wave-iii',
    focusLevel: 12,
    title: { en: 'Freedom', fr: 'Liberté' },
    beatHz: 12,
    bandLabel: { en: 'α 8–13 Hz (12 Hz is alpha, not theta)', fr: 'α 8–13 Hz (12 Hz = alpha, pas thêta)' },
  },
  'wave-iv': {
    roman: 'IV',
    slug: 'wave-iv',
    focusLevel: 15,
    title: { en: 'Adventure', fr: 'Aventure' },
    beatHz: 15,
    bandLabel: { en: 'β 13–30 Hz (layered mix, not a single tone)', fr: 'β 13–30 Hz (mélange en couches, pas une seule note)' },
  },
  'wave-v': {
    roman: 'V',
    slug: 'wave-v',
    focusLevel: 15,
    title: { en: 'Exploring Focus 15', fr: 'Exploration Focus 15' },
    beatHz: 15,
    bandLabel: { en: 'β 13–30 Hz (layered mix, not a single tone)', fr: 'β 13–30 Hz (mélange en couches, pas une seule note)' },
  },
  'wave-vi': {
    roman: 'VI',
    slug: 'wave-vi',
    focusLevel: 21,
    title: { en: 'Odyssey', fr: 'Odyssée' },
    beatHz: 21,
    bandLabel: { en: 'β 13–30 Hz (layered mix, not a single tone)', fr: 'β 13–30 Hz (mélange en couches, pas une seule note)' },
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
    bandLabel: { en: 'α 8–13 Hz (often + θ 4–8)', fr: 'α 8–13 Hz (souvent + θ 4–8)' },
  },
  'wave-ii': {
    roman: 'II',
    slug: 'wave-ii',
    focusLevel: 12,
    title: { en: 'Threshold', fr: 'Seuil' },
    beatHz: 12,
    bandLabel: { en: 'α 8–13 Hz (12 Hz is alpha, not theta)', fr: 'α 8–13 Hz (12 Hz = alpha, pas thêta)' },
  },
  'wave-iii': {
    roman: 'III',
    slug: 'wave-iii',
    focusLevel: 12,
    title: { en: 'Freedom', fr: 'Liberté' },
    beatHz: 12,
    bandLabel: { en: 'α 8–13 Hz (12 Hz is alpha, not theta)', fr: 'α 8–13 Hz (12 Hz = alpha, pas thêta)' },
  },
  'wave-iv': {
    roman: 'IV',
    slug: 'wave-iv',
    focusLevel: 15,
    title: { en: 'Adventure', fr: 'Aventure' },
    beatHz: 15,
    bandLabel: { en: 'β 13–30 Hz (layered mix, not a single tone)', fr: 'β 13–30 Hz (mélange en couches, pas une seule note)' },
  },
  'wave-v': {
    roman: 'V',
    slug: 'wave-v',
    focusLevel: 15,
    title: { en: 'Exploring Focus 15', fr: 'Exploration Focus 15' },
    beatHz: 15,
    bandLabel: { en: 'β 13–30 Hz (layered mix, not a single tone)', fr: 'β 13–30 Hz (mélange en couches, pas une seule note)' },
  },
  'wave-vi': {
    roman: 'VI',
    slug: 'wave-vi',
    focusLevel: 21,
    title: { en: 'Prospecting', fr: 'Prospection' },
    beatHz: 21,
    bandLabel: { en: 'β 13–30 Hz (layered mix, not a single tone)', fr: 'β 13–30 Hz (mélange en couches, pas une seule note)' },
  },
  'wave-vii': {
    roman: 'VII',
    slug: 'wave-vii',
    focusLevel: 21,
    title: { en: 'Odyssey', fr: 'Odyssée' },
    beatHz: 21,
    bandLabel: { en: 'β 13–30 Hz (layered mix, not a single tone)', fr: 'β 13–30 Hz (mélange en couches, pas une seule note)' },
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

// Focus map: Monroe Institute UK overview + Gateway home-study labels (F3).
// https://www.monroeinstituteuk.org/focus-levels/
const glossary = [
  {
    focus: 1,
    title: { en: 'C1 — waking life', fr: 'C1 — veille quotidienne' },
    desc: {
      en: 'Ordinary waking consciousness, fully in phase with physical-matter reality. Also called C1. Everything else on this list is a shift of that same awareness — not an exit from a body you leave behind.',
      fr: 'Conscience de veille ordinaire, entièrement en phase avec la réalité matérielle. Aussi appelée C1. Les autres Focus sont des décalages de cette même conscience — pas une sortie définitive du corps.',
    },
  },
  {
    focus: 3,
    title: { en: 'Early Hemi-Sync', fr: 'Hemi-Sync d’entrée' },
    desc: {
      en: 'Light Hemi-Sync used on some introductory tapes (including French Wave I orientation). A first step off C1 toward the deeper relaxation of Focus 10; not listed on the Monroe UK overview.',
      fr: 'Hemi-Sync léger de certaines bandes d’introduction (dont l’orientation Vague I en français). Premier pas hors de C1 vers la relaxation plus profonde du Focus 10 ; absent du panorama Monroe UK.',
    },
  },
  {
    focus: 10,
    title: { en: 'Mind awake, body asleep', fr: 'Esprit éveillé, corps endormi' },
    desc: {
      en: 'The body is deeply relaxed; the mind stays conscious, awake, and alert. This is the first state Gateway Voyage / Wave I trains you to stabilize — the platform for everything that follows.',
      fr: 'Le corps est profondément détendu ; l’esprit reste conscient, éveillé et alerte. Premier état que le Gateway Voyage / la Vague I vous apprennent à stabiliser — la base de tout le reste.',
    },
  },
  {
    focus: 11,
    title: { en: 'Access Channel', fr: 'Canal d’accès' },
    desc: {
      en: 'A communication channel across mental, physical, and emotional awareness. Monroe opens it in each Human Plus exercise (the Humain Plus supplements on this site).',
      fr: 'Canal de communication entre les niveaux mental, physique et émotionnel. Monroe l’ouvre à chaque exercice Human Plus (suppléments Humain Plus sur ce site).',
    },
  },
  {
    focus: 12,
    title: { en: 'Expanded awareness', fr: 'Conscience élargie' },
    desc: {
      en: 'Awareness widens while the body stays deeply relaxed and “asleep.” Gateway Waves II–IV use this as the working state for patterning, problem-solving, energy tools, and first-stage separation.',
      fr: 'La conscience s’élargit alors que le corps reste profondément détendu et « endormi ». Les vagues II–IV s’en servent pour le patterning, la résolution de problèmes, les outils d’énergie et la première séparation.',
    },
  },
  {
    focus: 15,
    title: { en: 'No-Time', fr: 'Non-Temps' },
    desc: {
      en: 'Consciousness is far from physical-body signals; linear time drops out of the experience. Often called the Void or Pure Potential. Wave V lives here. (The 1983 CIA paper instead frames 15 as movement “into the past.”)',
      fr: 'La conscience s’éloigne des signaux du corps ; le temps linéaire n’a plus de prise. Souvent appelé le Vide ou le Potentiel pur. La Vague V s’y tient. (Le rapport CIA 1983 présente plutôt le 15 comme un voyage « dans le passé ».)',
    },
  },
  {
    focus: 18,
    title: { en: 'Unconditional love', fr: 'Amour inconditionnel' },
    desc: {
      en: 'A state used to cultivate unconditional love and acceptance — less a destination on the home Gateway set than a quality of being that later programmes develop.',
      fr: 'État où l’on cultive amour inconditionnel et acceptation — moins une étape du coffret Gateway maison qu’une qualité d’être travaillée dans les programmes suivants.',
    },
  },
  {
    focus: 21,
    title: { en: 'Bridge to other realities', fr: 'Pont vers d’autres réalités' },
    desc: {
      en: 'The edge of time/space perception; the mind stays fully conscious and active. Wave VI / Odyssey (classic) and Wave VII (v2) aim here. (The CIA paper treats 21 as “the future.”)',
      fr: 'Lisière de la perception espace-temps ; l’esprit reste pleinement conscient et actif. Vague VI / Odyssée (classique) et Vague VII (v2). (Le rapport CIA en fait « le futur ».)',
    },
  },
  {
    focus: 22,
    title: { en: 'Time/space border', fr: 'Frontière espace-temps' },
    desc: {
      en: 'The border between time/space and non-physical states of being — associated with the comatose condition. Beyond Gateway home study (Lifeline and later).',
      fr: 'Frontière entre l’espace-temps et les états non physiques — associée à l’état comateux. Au-delà du Gateway à domicile (Lifeline et suivants).',
    },
  },
  {
    focus: 23,
    title: { en: 'New arrivals', fr: 'Nouveaux arrivants' },
    desc: {
      en: 'The condition someone may meet immediately after physical death — territory of the “new arrivals.” Mapped in Lifeline, not in the six-wave home set.',
      fr: 'État où l’on peut se trouver juste après la mort physique — territoire des « nouveaux arrivants ». Cartographié dans Lifeline, pas dans les six vagues à domicile.',
    },
  },
  {
    focus: 24,
    title: { en: 'Belief System Territories', fr: 'Territoires des croyances' },
    desc: {
      en: 'Non-physical activity shaped by simple or primitive religious and cultural beliefs. Together with 25–26, the Belief System Territories: thought-responsive places explored in Lifeline and Exploration 27.',
      fr: 'Activité non physique modelée par des croyances religieuses ou culturelles simples ou primitives. Avec 25–26 : Territoires des systèmes de croyance, environnements sensibles à la pensée (Lifeline, Exploration 27).',
    },
  },
  {
    focus: 25,
    title: { en: 'Organised religions', fr: 'Religions organisées' },
    desc: {
      en: 'Expression of the major organised religious beliefs of recent human history — still inside the Belief System Territories (24–26).',
      fr: 'Expression des grandes croyances religieuses organisées de l’histoire humaine récente — toujours dans les Territoires des croyances (24–26).',
    },
  },
  {
    focus: 26,
    title: { en: 'Personal belief structures', fr: 'Croyances personnelles' },
    desc: {
      en: 'A few areas holding structures and knowledge of highly individual religious or other beliefs grounded in direct experience of self. Last of the Belief System Territories.',
      fr: 'Quelques zones qui portent les structures et savoirs de croyances très individuelles, religieuses ou non, fondées sur l’expérience directe de soi. Dernier des Territoires des croyances.',
    },
  },
  {
    focus: 27,
    title: { en: 'The way-station', fr: 'La station' },
    desc: {
      en: 'Near the edge of human thought capacity: a way-station (not a terminus) for rest after the trauma of physical death, life review, and planning the next phase. Core of Exploration 27.',
      fr: 'Près de la limite de la pensée humaine : une station (pas un terminus) pour se reposer après le traumatisme de la mort physique, revoir sa vie et préparer la phase suivante. Cœur d’Exploration 27.',
    },
  },
  {
    focus: '34/35',
    title: { en: 'The Gathering', fr: 'Le Rassemblement' },
    desc: {
      en: 'Area of the Gathering: beings from many locations in the physical universe, described as assembled to witness coming Earth changes. First mapped in Bob Monroe’s Far Journeys (Starlines programmes).',
      fr: 'Zone du Rassemblement : êtres venus de nombreux lieux de l’univers physique, décrits comme réunis pour témoigner des changements terrestres à venir. Cartographié dans Far Journeys (programmes Starlines).',
    },
  },
  {
    focus: 42,
    title: { en: 'I-There cluster', fr: 'Grappe I-There' },
    desc: {
      en: 'I-There cluster consciousness — a later Monroe label for a group identity beyond a single lifetime. Far beyond the Gateway home waves.',
      fr: 'Conscience de grappe I-There — label Monroe plus tardif pour une identité de groupe au-delà d’une seule vie. Bien au-delà des vagues Gateway à domicile.',
    },
  },
  {
    focus: 49,
    title: { en: 'Sea of I-There clusters', fr: 'Mer de grappes I-There' },
    desc: {
      en: 'A “sea” of I-There clusters — the outermost Focus label on the Monroe UK overview.',
      fr: 'Une « mer » de grappes I-There — le label Focus le plus lointain du panorama Monroe UK.',
    },
  },
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

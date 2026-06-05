# Gateway Experience — AGENTS.md

## Repository

- **GitHub:** [github.com/nmarchand73/gateway_experience](https://github.com/nmarchand73/gateway_experience)
- **GitHub Pages:** [nmarchand73.github.io/gateway_experience/](https://nmarchand73.github.io/gateway_experience/)

Local folder may be named `gateway_process`; the published site base path is `/gateway_experience/` (matches the repo name).

## Overview

Static **Astro 6** site for the Hemi-Sync Gateway Experience learning path. Media lives in `data/` (~6 GB); curriculum metadata in `content/curriculum.json`.

Two audio editions are supported:

- **classic** — 6 waves, FLAC (Waves I–II also FR MP3), routes under `/waves/`
- **v2** — 7 waves, English MP3 (`data/Hemi-Sync Gateway Experience - v2/`), routes under `/v2/waves/` (and `/en/v2/waves/`)

Wave VI in v2 is **Prospecting**; Wave VII is **Odyssey** (classic Wave VI = Odyssey only).

## Dev server

```bash
npm install
npm run build-curriculum
npm run dev
```

Open **http://localhost:4321/gateway_experience/** (not the site root).

Audio/PDF/JPG are served from `public/media/` (junction to `data/`, created by `npm run dev`). Production build copies `data/` → `dist/media/` via `copy-media.mjs`.

## Build

```bash
npm run build
```

Runs curriculum generation, Astro static build, then copies `data/` → `dist/media/`.

## Git and media (important)

`data/` (~6 GB FLAC/MP3/PDF) is **not** in git (see `.gitignore`). Reasons:

1. **`git add` + LFS** copies each file into `.git/lfs/tmp/` — you need **several GB free** on `C:` or the add fails with *Espace insuffisant sur le disque*.
2. **GitHub free LFS** is ~1 GB storage — not enough for this library.
3. **GitHub Pages** deploy artifacts are ~1 GB max — a full build with media cannot deploy via Actions.

What **is** tracked: site code, `content/`, and `data/manifest.json` (inventory for `npm run build-curriculum`).

**Local full site:** keep `data/` on disk → `npm run dev` / `npm run build` (copies media into `dist/`).

**Public GitHub Pages:** UI + manuals only; session audio URLs 404 until you host media elsewhere (CDN, private server, or local use only).

If a failed `git add` left the repo dirty:

```powershell
git reset
Remove-Item -Recurse -Force .git\lfs\tmp\* -ErrorAction SilentlyContinue
git add .
```

To retry LFS anyway (needs ~10 GB free + paid GitHub LFS): remove `data/**` from `.gitignore`, then `git config lfs.storage "D:/git-lfs"` if `C:` is tight.

## i18n

- Default locale: **fr** at `/gateway_experience/`
- English: `/gateway_experience/en/`
- Language preference: `localStorage` key `gateway-lang`

## Key paths

| Path | Role |
|------|------|
| `data/manifest.json` | Media inventory |
| `content/manuals/` | OCR wave manuals as Markdown (`npm run extract-manuals-md`) |
| `content/curriculum.json` | Generated waves/sessions + `editions.classic` / `editions.v2` |
| `scripts/extract-manuals-md.py` | PDF → `content/manuals/*.md` + per-session slices |
| `scripts/build-curriculum.mjs` | Manifest + v2 folder scan → curriculum |
| `src/components/GatewayAudioPlayer.astro` | Passthrough player + L/R spectrum 20–500 Hz |
| `src/pages/start/` | Guide de démarrage (5 étapes, conseils, FAQ — inspiré r/Sbreggo) |

## Progress

Session completion and journals use `localStorage` only (`gateway-progress-v1`, `gateway-journal-<sessionId>`). v2 sessions use progress keys prefixed `v2:` (e.g. `v2:wave-i-01`).

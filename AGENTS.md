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

`data/` (~9.5 GB FLAC/MP3/PDF) is tracked via **Git LFS** (see `.gitattributes`).

**Disk space:** `git add` writes LFS objects under `.git/lfs/objects/` while keeping your working copy. With ~7 GB free on `C:`, add media **one top-level folder at a time**, then push and prune:

```powershell
git add "data/Hemi-Sync"
git commit -m "Add Hemi-Sync FR MP3 edition (LFS)"
git lfs push origin main --all
git lfs prune
```

Repeat for `data/Hemi-Sync Gateway Experience - v2` then `data/Hemi-Sync - The Gateway Experience`.

**GitHub LFS quota:** free accounts include ~1 GB LFS storage — this library needs a **paid LFS data pack** (or another remote) before `git lfs push` completes for all ~9.5 GB.

**GitHub Pages:** CI sets `SKIP_COPY_MEDIA=1` — the public site is UI + manuals; session audio plays only when `data/` exists locally (or you point URLs at external hosting).

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
| `src/components/GatewayAudioPlayer.astro` | Passthrough player + L/R spectrum 20 Hz–4 kHz (log) |
| `src/pages/start/` | Guide de démarrage (5 étapes, conseils, FAQ — inspiré r/Sbreggo) |

## Progress

Session completion and journals use `localStorage` only (`gateway-progress-v1`, `gateway-journal-<sessionId>`). v2 sessions use progress keys prefixed `v2:` (e.g. `v2:wave-i-01`).

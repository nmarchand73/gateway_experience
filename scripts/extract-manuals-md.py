#!/usr/bin/env python3
"""
Extract OCR'd Gateway Experience wave manuals (PDF) to Markdown.

Outputs:
  content/manuals/wave-{i..vi}.md       — full wave manual with YAML frontmatter
  content/manuals/sessions/{id}.md    — per-exercise sections when detectable
  content/manuals/index.json            — machine-readable index
  content/manuals/README.md             — human TOC

Requires: pymupdf4llm, pymupdf
  pip install pymupdf4llm
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import pymupdf
    import pymupdf4llm
except ImportError:
    print("Error: install pymupdf4llm (pip install pymupdf4llm)", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = ROOT / "data" / "Hemi-Sync - The Gateway Experience"
OUT_DIR = ROOT / "content" / "manuals"
SESSIONS_DIR = OUT_DIR / "sessions"

WAVE_META = {
    "wave-i": {"roman": "I", "title": "Discovery", "prefix": "Discovery"},
    "wave-ii": {"roman": "II", "title": "Threshold", "prefix": "Threshold"},
    "wave-iii": {"roman": "III", "title": "Freedom", "prefix": "Freedom"},
    "wave-iv": {"roman": "IV", "title": "Adventure", "prefix": "Adventure"},
    "wave-v": {"roman": "V", "title": "Exploring Focus 15", "prefix": "Exploring"},
    "wave-vi": {"roman": "VI", "title": "Odyssey", "prefix": "Odyssey"},
}

WAVE_SLUG_PATTERNS = [
    (re.compile(r"Wave I\b", re.I), "wave-i"),
    (re.compile(r"Wave II\b", re.I), "wave-ii"),
    (re.compile(r"Wave III\b", re.I), "wave-iii"),
    (re.compile(r"Wave IV\b", re.I), "wave-iv"),
    (re.compile(r"Wave V\b", re.I), "wave-v"),
    (re.compile(r"Wave VI\b", re.I), "wave-vi"),
]


def wave_slug_from_path(path: str) -> str | None:
    for pattern, slug in WAVE_SLUG_PATTERNS:
        if pattern.search(path):
            return slug
    return None


def find_wave_pdfs() -> dict[str, Path]:
    """Return one PDF path per wave slug (prefer shorter / root-level paths)."""
    found: dict[str, list[Path]] = {slug: [] for slug in WAVE_META}
    if not DATA_ROOT.exists():
        return {}

    for pdf in DATA_ROOT.rglob("*.pdf"):
        rel = pdf.relative_to(ROOT / "data").as_posix()
        slug = wave_slug_from_path(rel)
        if slug:
            found[slug].append(pdf)

    chosen: dict[str, Path] = {}
    for slug, paths in found.items():
        if not paths:
            continue
        paths.sort(key=lambda p: (len(p.parts), len(str(p))))
        chosen[slug] = paths[0]
    return chosen


def normalize_ligatures(text: str) -> str:
    return (
        text.replace("\ufb01", "fi")
        .replace("\ufb02", "fl")
        .replace("\u2014", "—")
        .replace("\u2013", "–")
    )


def pdf_to_markdown(pdf_path: Path) -> tuple[str, int]:
    doc = pymupdf.open(pdf_path)
    page_count = len(doc)
    doc.close()
    md = pymupdf4llm.to_markdown(str(pdf_path))
    if isinstance(md, bytes):
        md = md.decode("utf-8", errors="replace")
    return normalize_ligatures(md), page_count


def yaml_frontmatter(fields: dict) -> str:
    lines = ["---"]
    for key, value in fields.items():
        if isinstance(value, str):
            safe = value.replace('"', '\\"')
            lines.append(f'{key}: "{safe}"')
        else:
            lines.append(f"{key}: {value}")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def split_sessions(wave_slug: str, body: str) -> list[dict]:
    """Split wave manual into per-exercise sections when headings match."""
    meta = WAVE_META[wave_slug]
    prefix = re.escape(meta["prefix"])
    patterns = [
        # Discovery #1— Orientation (waves I–IV)
        re.compile(
            rf"(?m)^[^\n]*{prefix}\s*#\s*(\d+)\s*[—–-]\s*([^\n]+)",
            re.I,
        ),
        # Exploring 1—Advanced Focus 12 (waves V–VI)
        re.compile(
            rf"(?m)^[^\n]*{prefix}\s+(\d+)\s*[—–-]\s*([^\n]+)",
            re.I,
        ),
    ]

    matches: list[re.Match[str]] = []
    for pattern in patterns:
        matches = list(pattern.finditer(body))
        if matches:
            break

    if not matches:
        return []

    sections: list[dict] = []
    for i, match in enumerate(matches):
        index = int(match.group(1))
        heading_title = match.group(2).strip()
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        chunk = body[start:end].strip()
        session_id = f"{wave_slug}-{index:02d}"
        sections.append(
            {
                "sessionId": session_id,
                "index": index,
                "heading": match.group(0).strip().split("\n")[0][:120],
                "title": heading_title,
                "body": chunk,
            }
        )
    return sections


def write_wave_manual(
    wave_slug: str,
    pdf_path: Path,
    body: str,
    page_count: int,
    extracted_at: str,
) -> Path:
    meta = WAVE_META[wave_slug]
    rel_pdf = pdf_path.relative_to(ROOT / "data").as_posix()
    front = yaml_frontmatter(
        {
            "waveSlug": wave_slug,
            "roman": meta["roman"],
            "title": meta["title"],
            "sourcePdf": rel_pdf,
            "language": "en",
            "pages": page_count,
            "extractedAt": extracted_at,
        }
    )
    out_path = OUT_DIR / f"{wave_slug}.md"
    out_path.write_text(front + body.strip() + "\n", encoding="utf-8")
    return out_path


def write_session_manuals(
    wave_slug: str,
    pdf_path: Path,
    sections: list[dict],
    extracted_at: str,
) -> list[dict]:
    meta = WAVE_META[wave_slug]
    rel_pdf = pdf_path.relative_to(ROOT / "data").as_posix()
    index_entries: list[dict] = []

    for section in sections:
        front = yaml_frontmatter(
            {
                "sessionId": section["sessionId"],
                "waveSlug": wave_slug,
                "roman": meta["roman"],
                "waveTitle": meta["title"],
                "sessionIndex": section["index"],
                "sessionTitle": section["title"],
                "heading": section["heading"],
                "sourcePdf": rel_pdf,
                "language": "en",
                "extractedAt": extracted_at,
            }
        )
        rel_file = f"sessions/{section['sessionId']}.md"
        out_path = SESSIONS_DIR / f"{section['sessionId']}.md"
        out_path.write_text(front + section["body"].strip() + "\n", encoding="utf-8")
        index_entries.append(
            {
                "sessionId": section["sessionId"],
                "index": section["index"],
                "title": section["title"],
                "heading": section["heading"],
                "file": rel_file,
            }
        )
    return index_entries


def write_readme(index: dict) -> None:
    lines = [
        "# Gateway Experience — wave manuals (Markdown)",
        "",
        f"Extracted: {index['extractedAt']}",
        "",
        "Source PDFs live under `data/Hemi-Sync - The Gateway Experience/`.",
        "Regenerate with `npm run extract-manuals-md`.",
        "",
        "## Waves",
        "",
    ]
    for wave in index["waves"]:
        lines.append(f"### Wave {wave['roman']} — {wave['title']}")
        lines.append(f"- Full manual: [`{wave['markdownFile']}`](./{wave['markdownFile']})")
        lines.append(f"- Source: `{wave['sourcePdf']}` ({wave['pages']} pages)")
        if wave.get("sessions"):
            lines.append("- Sessions:")
            for s in wave["sessions"]:
                lines.append(
                    f"  - [{s['sessionId']}](./{s['file']}): {s['title']}"
                )
        lines.append("")
    OUT_DIR.joinpath("README.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    pdfs = find_wave_pdfs()
    if not pdfs:
        print(f"No PDFs found under {DATA_ROOT}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

    extracted_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    index_waves: list[dict] = []

    for wave_slug in WAVE_META:
        if wave_slug not in pdfs:
            print(f"Warning: missing PDF for {wave_slug}", file=sys.stderr)
            continue

        pdf_path = pdfs[wave_slug]
        print(f"Converting {pdf_path.name} …")
        body, page_count = pdf_to_markdown(pdf_path)
        write_wave_manual(wave_slug, pdf_path, body, page_count, extracted_at)

        sections = split_sessions(wave_slug, body)
        session_entries = write_session_manuals(wave_slug, pdf_path, sections, extracted_at)
        print(f"  -> {wave_slug}.md ({page_count} pages, {len(sections)} sessions)")

        rel_pdf = pdf_path.relative_to(ROOT / "data").as_posix()
        index_waves.append(
            {
                "slug": wave_slug,
                "roman": WAVE_META[wave_slug]["roman"],
                "title": WAVE_META[wave_slug]["title"],
                "sourcePdf": rel_pdf,
                "pages": page_count,
                "markdownFile": f"{wave_slug}.md",
                "sessions": session_entries,
            }
        )

    index = {"extractedAt": extracted_at, "waves": index_waves}
    (OUT_DIR / "index.json").write_text(
        json.dumps(index, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    write_readme(index)
    print(f"Done - {len(index_waves)} waves -> {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

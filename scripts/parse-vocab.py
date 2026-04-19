#!/usr/bin/env python3
"""
Parse Italian vocabulary markdown files → src/data/vocabulary.js
Run: python3 scripts/parse-vocab.py
"""
import os, re, json
from pathlib import Path

ROOT = Path(__file__).parent.parent
VOCAB_ROOT = ROOT / "vocabulary"
REVIEW_ROOT = ROOT / "review"
OUTPUT = ROOT / "src" / "data" / "vocabulary.js"

def parse_markdown_file(file_path):
    content = Path(file_path).read_text(encoding="utf-8")
    lines = content.splitlines()

    sections = []
    current_section = None
    in_table = False
    table_headers = []
    is_conjugation = False

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("# ") and not current_section:
            current_section = {"title": stripped[2:].strip(), "entries": [], "is_conjugation": False}
            sections.append(current_section)
            continue

        if stripped.startswith("## "):
            heading = stripped[3:].strip()
            is_conjugation = "conjugation" in heading.lower()
            current_section = {"title": heading, "entries": [], "is_conjugation": is_conjugation}
            sections.append(current_section)
            in_table = False
            table_headers = []
            continue

        # Table separator
        if re.match(r'^\|[-: |]+\|$', stripped):
            in_table = True
            continue

        # Table row
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = [c.strip() for c in stripped[1:-1].split("|")]

            if not in_table:
                table_headers = [h.lower() for h in cells]
                continue

            entry = parse_row(cells, table_headers, is_conjugation)
            if entry and current_section is not None:
                current_section["entries"].append(entry)
            continue

        if not stripped.startswith("|"):
            in_table = False
            table_headers = []

    return sections

def parse_row(cells, headers, is_conjugation):
    if all(c == "" for c in cells):
        return None

    h0 = headers[0] if headers else ""
    h1 = headers[1] if len(headers) > 1 else ""

    # Standard: Italian | Portuguese | English (| Notes)
    if h0 == "italian" and h1 == "portuguese":
        italian = cells[0] if len(cells) > 0 else ""
        portuguese = cells[1] if len(cells) > 1 else ""
        english = cells[2] if len(cells) > 2 else ""
        notes = cells[3] if len(cells) > 3 and cells[3] else None
        if not italian:
            return None
        entry_type = "conjugation" if is_conjugation else detect_type(italian)
        return {"italian": italian, "portuguese": portuguese, "english": english,
                "notes": notes, "entryType": entry_type}

    # Noun with gender: Italian | Gender | Portuguese | English
    if h0 == "italian" and h1 == "gender":
        italian = cells[0] if len(cells) > 0 else ""
        portuguese = cells[2] if len(cells) > 2 else ""
        english = cells[3] if len(cells) > 3 else ""
        if not italian:
            return None
        return {"italian": italian, "portuguese": portuguese, "english": english,
                "notes": None, "entryType": "word"}

    return None  # skip articles, adjective tables, people tables

def detect_type(italian):
    if any(c in italian for c in ["?", "!", " ", "..."]):
        return "phrase"
    return "word"

def build_user_vocab(user_folder):
    dir_path = VOCAB_ROOT / user_folder
    if not dir_path.exists():
        return {"units": []}
    files = sorted(f for f in dir_path.iterdir() if f.suffix == ".md")
    units = []
    for f in files:
        sections = parse_markdown_file(f)
        entries = [e for s in sections for e in s["entries"]]
        title = sections[0]["title"] if sections else f.stem
        units.append({
            "id": f"{user_folder.lower()}_{f.stem}",
            "title": title,
            "source": f.name,
            "entries": entries,
        })
    return {"units": units}

def build_trip_vocab():
    file_path = VOCAB_ROOT / "Trip" / "trip_italy.md"
    if not file_path.exists():
        return {"id": "trip", "title": "Italy Trip", "sections": [], "entries": []}
    sections = parse_markdown_file(file_path)
    valid = [s for s in sections if s["entries"]]
    all_entries = [e for s in valid for e in s["entries"]]
    def slugify(s):
        return re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')
    return {
        "id": "trip",
        "title": "Italy Trip Vocabulary",
        "sections": [{"id": slugify(s["title"]), "title": s["title"], "entries": s["entries"]} for s in valid],
        "entries": all_entries,
    }

def build_review_vocab(user):
    file_path = REVIEW_ROOT / user / "review_words.md"
    if not file_path.exists():
        return {"entries": []}
    sections = parse_markdown_file(file_path)
    entries = [e for s in sections for e in s["entries"]]
    return {"entries": entries}

luigi = build_user_vocab("Luigi")
jasmine = build_user_vocab("Jasmine")
trip = build_trip_vocab()
review_luigi = build_review_vocab("Luigi")
review_jasmine = build_review_vocab("Jasmine")

data = {
    "users": {"luigi": luigi, "jasmine": jasmine},
    "trip": trip,
    "review": {"luigi": review_luigi, "jasmine": review_jasmine},
}

js = (
    "// AUTO-GENERATED by scripts/parse-vocab.py — do not edit by hand\n"
    "// Run: python3 scripts/parse-vocab.py  (or: npm run build-data)\n\n"
    "const vocabulary = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n\n"
    "export default vocabulary;\n"
)

OUTPUT.write_text(js, encoding="utf-8")

luigi_count = sum(len(u["entries"]) for u in luigi["units"])
jasmine_count = sum(len(u["entries"]) for u in jasmine["units"])
print(f"Luigi:   {len(luigi['units'])} units, {luigi_count} entries")
print(f"Jasmine: {len(jasmine['units'])} units, {jasmine_count} entries")
print(f"Trip:    {len(trip['sections'])} sections, {len(trip['entries'])} entries")
print(f"Review Luigi:   {len(review_luigi['entries'])} entries")
print(f"Review Jasmine: {len(review_jasmine['entries'])} entries")
print(f"\nDone → src/data/vocabulary.js")

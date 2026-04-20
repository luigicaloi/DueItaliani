# DueItaliani — Claude Code Context

## Project

Personal Italian vocabulary practice app for **Luigi** and **Jasmine**, who are learning Italian from Portuguese via Duolingo. Built to feel like Duolingo.

**Live URL:** https://due-italiani-phi.vercel.app/
**Repo:** `/Users/luigicaloi/Documents/GitHub/DueItaliani/`

---

## Tech Stack

- **Vite + React** (no TypeScript, plain JSX)
- **Plain CSS** with CSS custom properties — no Tailwind, no CSS-in-JS
- **Nunito** font (Google Fonts, loaded in `index.html`)
- **No backend** — fully static SPA, all data bundled at build time
- **Deployment:** Vercel — auto-deploys on every push to `main`

---

## Folder Structure

```
DueItaliani/
├── vocabulary/
│   ├── Luigi/          9 unit .md files (units 1–9)
│   ├── Jasmine/        11 unit .md files (units 1–10 + section 2 unit 1)
│   └── Trip/           trip_italy.md — shared Italy trip vocabulary
├── review/
│   ├── Luigi/review_words.md
│   └── Jasmine/review_words.md
├── scripts/
│   ├── parse-vocab.py   Converts .md files → src/data/vocabulary.js
│   ├── parse-vocab.js   Node.js equivalent (use Python version)
│   └── remove_bg.py     Removes solid-color backgrounds from PNGs (Pillow)
├── src/
│   ├── App.jsx          Screen router: user_select → mode_select → quiz → results
│   ├── App.css          Design tokens (CSS vars), base reset, logo styles
│   ├── data/
│   │   └── vocabulary.js  AUTO-GENERATED — do not edit by hand
│   ├── components/
│   │   ├── UserSelect/    Landing page — Luigi or Jasmine card selection
│   │   ├── ModeSelect/    Three mode cards per user
│   │   ├── Quiz/          Quiz screen + ProgressBar, Hearts, AnswerChoice
│   │   ├── Results/       Post-quiz score screen
│   │   └── shared/        Button component + shared.css
│   ├── hooks/
│   │   └── useQuiz.js     Quiz state machine (ASKING → REVIEWING → FINISHED)
│   └── utils/
│       └── quizEngine.js  buildSession(), distractor generation, EmptyPoolError
└── public/
    └── assets/
        ├── luigi.png      Character image — transparent PNG
        └── jasmine.png    Character image — transparent PNG
```

---

## Users

| User | Units | Notes |
|------|-------|-------|
| Luigi | 9 (Section 1, units 1–9) | ~178 vocabulary entries |
| Jasmine | 11 (Section 1 units 1–10 + Section 2 unit 1) | ~253 vocabulary entries |

Both learning **Italian from Portuguese** via Duolingo.

---

## Practice Modes

| Mode | Source | Notes |
|------|--------|-------|
| Duolingo Words | `vocabulary/{User}/*.md` | All units merged |
| Challenging Words | `review/{User}/review_words.md` | Empty until words are added |
| Trip Words | `vocabulary/Trip/trip_italy.md` | Shared for both users |

---

## Updating Vocabulary

1. Edit or add `.md` files in `vocabulary/` or `review/`
2. Run: `python3 scripts/parse-vocab.py`
3. Commit and push — Vercel redeploys automatically

Vocabulary files are Markdown tables: `| Italian | Portuguese | English |`
Review files add a fourth column: `| Italian | Portuguese | English | Notes |`

The parser skips: article tables, adjective agreement tables, the "People on the trip" name table.

---

## Running Locally

```bash
npm install       # first time only
npm run dev       # → http://localhost:5173
npm run build     # production build to dist/
```

---

## Design System

Key CSS variables in `src/App.css`:
- `--green-primary: #58CC02` — Duolingo green
- `--green-dark: #46A302` — used for button/text shadows
- `--red-primary: #FF4B4B` — wrong answers
- `--font: 'Nunito'` — weight 900 for headings/logo

Logo: `DueItaliani` in Nunito 900 with `text-shadow: 0 4px 0 var(--green-dark)`.
Character cards: coloured avatar band (Luigi=#d6ecf5, Jasmine=#e8d0f7) + transparent PNG image.

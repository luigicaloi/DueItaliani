# DueItaliani 🇮🇹

A personal Italian vocabulary practice app for Luigi and Jasmine, inspired by Duolingo.

**→ [due-italiani-phi.vercel.app](https://due-italiani-phi.vercel.app/)**

---

## What it is

Luigi and Jasmine are learning Italian from Portuguese via Duolingo. DueItaliani lets them drill their vocabulary in a Duolingo-style quiz — multiple choice, both directions (Italian → Portuguese and Portuguese → Italian), with hearts, a progress bar, and a results screen.

## Practice modes

| Mode | What it drills |
|------|---------------|
| 📚 Duolingo Words | All vocabulary from their Duolingo lessons |
| ⚡ Challenging Words | Words flagged as tricky (per user) |
| ✈️ Trip Words | Vocabulary for an upcoming trip to Italy |

## Running locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Adding vocabulary

Vocabulary lives in plain Markdown tables under `vocabulary/`. To add new words:

1. Edit a file in `vocabulary/Luigi/`, `vocabulary/Jasmine/`, or `vocabulary/Trip/`
2. Run `python3 scripts/parse-vocab.py` to regenerate the app data
3. Commit and push — the site updates automatically via Vercel

To add challenging/review words, edit `review/Luigi/review_words.md` or `review/Jasmine/review_words.md`.

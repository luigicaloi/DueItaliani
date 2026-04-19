// AUTO-RUN: node scripts/parse-vocab.js
// Reads vocabulary/ and review/ markdown files, writes src/data/vocabulary.js

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const VOCAB_ROOT = resolve(ROOT, 'vocabulary')
const REVIEW_ROOT = resolve(ROOT, 'review')
const OUTPUT = resolve(ROOT, 'src/data/vocabulary.js')

// ---------------------------------------------------------------------------
// Markdown table parser
// ---------------------------------------------------------------------------

function parseMarkdownFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const sections = []
  let currentSection = null
  let inTable = false
  let tableHeaders = []
  let isConjugationSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // # Title line → file title, start first implicit section
    if (line.startsWith('# ') && !currentSection) {
      currentSection = { title: line.slice(2).trim(), entries: [], isConjugation: false }
      sections.push(currentSection)
      continue
    }

    // ## Subsection heading
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim()
      isConjugationSection = heading.toLowerCase().includes('conjugation')
      currentSection = { title: heading, entries: [], isConjugation: isConjugationSection }
      sections.push(currentSection)
      inTable = false
      tableHeaders = []
      continue
    }

    // Table separator line (---|---) → skip, marks we're in a table
    if (/^\|[-: |]+\|$/.test(line)) {
      inTable = true
      continue
    }

    // Table row
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map(c => c.trim())

      if (!inTable) {
        // This is the header row
        tableHeaders = cells.map(h => h.toLowerCase())
        continue
      }

      // Classify and parse the table row
      const entry = parseRow(cells, tableHeaders, isConjugationSection)
      if (entry && currentSection) {
        currentSection.entries.push(entry)
      }
      continue
    }

    // Any non-table line resets table state
    if (!line.startsWith('|')) {
      inTable = false
      tableHeaders = []
    }
  }

  return sections
}

function parseRow(cells, headers, isConjugation) {
  // Skip empty rows
  if (cells.every(c => c === '')) return null

  const h0 = headers[0] || ''
  const h1 = headers[1] || ''

  // Standard: Italian | Portuguese | English (| Notes)
  if (h0 === 'italian' && h1 === 'portuguese') {
    const italian = cells[0] || ''
    const portuguese = cells[1] || ''
    const english = cells[2] || ''
    const notes = cells[3] || null
    if (!italian) return null
    return {
      italian,
      portuguese,
      english,
      notes: notes && notes !== '' ? notes : null,
      entryType: isConjugation ? 'conjugation' : detectEntryType(italian, portuguese),
    }
  }

  // Noun with gender: Italian | Gender | Portuguese | English
  if (h0 === 'italian' && h1 === 'gender') {
    const italian = cells[0] || ''
    const portuguese = cells[2] || ''
    const english = cells[3] || ''
    if (!italian) return null
    return { italian, portuguese, english, notes: null, entryType: 'word' }
  }

  // Skip: article tables, adjective agreement, people tables
  return null
}

function detectEntryType(italian, portuguese) {
  // Phrases tend to contain spaces and common function words
  const phraseIndicators = ['?', '!', ' ', '...']
  if (phraseIndicators.some(p => italian.includes(p))) return 'phrase'
  return 'word'
}

// ---------------------------------------------------------------------------
// Build user vocabulary from a folder of unit files
// ---------------------------------------------------------------------------

function buildUserVocab(userFolder) {
  const dirPath = resolve(VOCAB_ROOT, userFolder)
  if (!existsSync(dirPath)) return { units: [] }

  const files = readdirSync(dirPath)
    .filter(f => f.endsWith('.md'))
    .sort()

  const units = []
  for (const file of files) {
    const sections = parseMarkdownFile(resolve(dirPath, file))
    // Flatten all sections from this file into entries for this unit
    const entries = sections.flatMap(s => s.entries)
    const title = sections[0]?.title || file.replace('.md', '')
    units.push({
      id: `${userFolder.toLowerCase()}_${file.replace('.md', '')}`,
      title,
      source: file,
      entries,
    })
  }
  return { units }
}

// ---------------------------------------------------------------------------
// Build trip vocabulary
// ---------------------------------------------------------------------------

function buildTripVocab() {
  const filePath = resolve(VOCAB_ROOT, 'Trip', 'trip_italy.md')
  if (!existsSync(filePath)) return { id: 'trip', title: 'Italy Trip', sections: [], entries: [] }

  const sections = parseMarkdownFile(filePath)
  // Skip the first section if it's the "People on the trip" table (no standard entries)
  const validSections = sections.filter(s => s.entries.length > 0)
  const allEntries = validSections.flatMap(s => s.entries)

  return {
    id: 'trip',
    title: 'Italy Trip Vocabulary',
    sections: validSections.map(s => ({ id: slugify(s.title), title: s.title, entries: s.entries })),
    entries: allEntries,
  }
}

// ---------------------------------------------------------------------------
// Build review vocabulary
// ---------------------------------------------------------------------------

function buildReviewVocab(user) {
  const filePath = resolve(REVIEW_ROOT, user, 'review_words.md')
  if (!existsSync(filePath)) return { entries: [] }

  const sections = parseMarkdownFile(filePath)
  const entries = sections.flatMap(s => s.entries)
  return { entries }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const luigi = buildUserVocab('Luigi')
const jasmine = buildUserVocab('Jasmine')
const trip = buildTripVocab()
const reviewLuigi = buildReviewVocab('Luigi')
const reviewJasmine = buildReviewVocab('Jasmine')

const data = {
  users: { luigi, jasmine },
  trip,
  review: { luigi: reviewLuigi, jasmine: reviewJasmine },
}

const output =
  '// AUTO-GENERATED by scripts/parse-vocab.js — do not edit by hand\n' +
  '// Run: npm run build-data\n\n' +
  'const vocabulary = ' +
  JSON.stringify(data, null, 2) +
  ';\n\nexport default vocabulary;\n'

writeFileSync(OUTPUT, output, 'utf-8')

// Print summary
const luigiCount = luigi.units.reduce((n, u) => n + u.entries.length, 0)
const jasmineCount = jasmine.units.reduce((n, u) => n + u.entries.length, 0)
const tripCount = trip.entries.length
console.log(`Luigi:   ${luigi.units.length} units, ${luigiCount} entries`)
console.log(`Jasmine: ${jasmine.units.length} units, ${jasmineCount} entries`)
console.log(`Trip:    ${trip.sections.length} sections, ${tripCount} entries`)
console.log(`Review Luigi:   ${reviewLuigi.entries.length} entries`)
console.log(`Review Jasmine: ${reviewJasmine.entries.length} entries`)
console.log(`\nDone → src/data/vocabulary.js`)

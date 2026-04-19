export class EmptyPoolError extends Error {}

const SESSION_SIZE = 20

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickDisctractors(correct, answerField, pool, fallbackPool, count = 3) {
  const sameUnitCandidates = pool
    .filter(e => e[answerField] !== correct[answerField] && e[answerField])

  const fallbackCandidates = fallbackPool
    .filter(e => e[answerField] !== correct[answerField] && e[answerField])

  const candidates = shuffle([...sameUnitCandidates])
  const fallback = shuffle(fallbackCandidates)
  const seen = new Set([correct[answerField]])
  const distractors = []

  for (const pool of [candidates, fallback]) {
    for (const entry of pool) {
      if (distractors.length >= count) break
      if (!seen.has(entry[answerField])) {
        seen.add(entry[answerField])
        distractors.push(entry[answerField])
      }
    }
    if (distractors.length >= count) break
  }

  return distractors
}

export function buildSession(modeEntries, allEntries, unitEntries = null) {
  if (!modeEntries || modeEntries.length < 4) {
    throw new EmptyPoolError('Not enough entries to build a quiz session.')
  }

  const shuffled = shuffle(modeEntries)
  const pool = shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length))
  const questions = []

  for (let i = 0; i < pool.length; i++) {
    const entry = pool[i]
    // Alternate direction: even = IT→PT, odd = PT→IT
    const direction = i % 2 === 0 ? 'IT_to_PT' : 'PT_to_IT'

    const [promptField, answerField] =
      direction === 'IT_to_PT'
        ? ['italian', 'portuguese']
        : ['portuguese', 'italian']

    if (!entry[promptField] || !entry[answerField]) continue

    // Same unit distractors preferred; fall back to all entries
    const sameUnit = unitEntries
      ? unitEntries.filter(e => e !== entry)
      : modeEntries.filter(e => e !== entry)

    const distractors = pickDisctractors(entry, answerField, sameUnit, allEntries)

    if (distractors.length < 3) continue

    const choices = shuffle([entry[answerField], ...distractors])

    questions.push({
      id: `q_${i}`,
      prompt: entry[promptField],
      answer: entry[answerField],
      choices,
      direction,
      sourceEntry: entry,
    })
  }

  if (questions.length < 4) {
    throw new EmptyPoolError('Could not generate enough questions.')
  }

  return { questions: questions.slice(0, SESSION_SIZE) }
}

export function getSessionEntries(userId, mode, vocabulary) {
  if (mode === 'duolingo') {
    const units = vocabulary.users[userId]?.units ?? []
    const allEntries = units.flatMap(u => u.entries)
    return { entries: allEntries, allEntries, unitEntries: null }
  }

  if (mode === 'review') {
    const entries = vocabulary.review[userId]?.entries ?? []
    const allEntries = [
      ...(vocabulary.users[userId]?.units ?? []).flatMap(u => u.entries),
      ...vocabulary.trip.entries,
    ]
    return { entries, allEntries, unitEntries: null }
  }

  if (mode === 'trip') {
    const entries = vocabulary.trip.entries
    const allEntries = [
      ...entries,
      ...(vocabulary.users[userId]?.units ?? []).flatMap(u => u.entries),
    ]
    return { entries, allEntries, unitEntries: null }
  }

  return { entries: [], allEntries: [], unitEntries: null }
}

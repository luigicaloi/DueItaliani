import { useState, useCallback, useMemo } from 'react'
import { buildSession, getSessionEntries, EmptyPoolError } from '../utils/quizEngine.js'

const MAX_HEARTS = 3

export default function useQuiz(userId, mode, vocabulary) {
  const { entries, allEntries } = useMemo(
    () => getSessionEntries(userId, mode, vocabulary),
    [userId, mode, vocabulary]
  )

  const [session, error] = useMemo(() => {
    try {
      return [buildSession(entries, allEntries), null]
    } catch (e) {
      if (e instanceof EmptyPoolError) return [null, e]
      throw e
    }
  }, [entries, allEntries])

  const [questionIndex, setQuestionIndex] = useState(0)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null) // null | { selected, correct }
  const [finished, setFinished] = useState(false)

  const currentQuestion = session?.questions[questionIndex] ?? null
  const total = session?.questions.length ?? 0

  const submitAnswer = useCallback((choice) => {
    if (!currentQuestion || answered) return
    const correct = choice === currentQuestion.answer
    if (correct) {
      setScore(s => s + 1)
    } else {
      setHearts(h => h - 1)
    }
    setAnswered({ selected: choice, correct })
  }, [currentQuestion, answered])

  const advance = useCallback(() => {
    if (!answered) return
    const nextIndex = questionIndex + 1
    // hearts is already decremented if last answer was wrong
    if (nextIndex >= total || hearts <= 0) {
      setFinished(true)
      return
    }
    setAnswered(null)
    setQuestionIndex(nextIndex)
  }, [answered, questionIndex, total, hearts])

  const result = finished
    ? { score, total, heartsLeft: hearts, passed: hearts > 0 }
    : null

  return {
    session,
    error,
    currentQuestion,
    questionIndex,
    total,
    hearts,
    answered,
    finished,
    result,
    submitAnswer,
    advance,
  }
}

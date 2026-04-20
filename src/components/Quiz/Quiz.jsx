import { useState, useCallback } from 'react'
import useQuiz from '../../hooks/useQuiz.js'
import ProgressBar from './ProgressBar.jsx'
import Hearts from './Hearts.jsx'
import AnswerChoice from './AnswerChoice.jsx'
import Button from '../shared/Button.jsx'
import './Quiz.css'

const DIRECTION_LABELS = {
  IT_to_PT: 'Italiano → Portoghese',
  PT_to_IT: 'Portoghese → Italiano',
}

export default function Quiz({ userId, mode, vocabulary, onFinish, onBack }) {
  const {
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
  } = useQuiz(userId, mode, vocabulary)

  const [addedWords, setAddedWords] = useState(new Set())

  const handleAddToReview = useCallback(async (entry) => {
    const key = entry.italian
    if (addedWords.has(key)) return
    try {
      await fetch('/api/add-review-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          italian: entry.italian,
          portuguese: entry.portuguese,
          english: entry.english || '',
          notes: entry.notes || '',
        }),
      })
      setAddedWords(prev => new Set([...prev, key]))
    } catch {
      // silently fail — user can add manually
    }
  }, [userId, addedWords])

  if (finished && result) {
    onFinish(result)
    return null
  }

  if (error) {
    return (
      <div className="page quiz">
        <div className="container">
          <div className="quiz__empty">
            <div className="quiz__empty-icon">📭</div>
            <div className="quiz__empty-title">Nessuna parola ancora!</div>
            <div className="quiz__empty-sub">
              Aggiungi parole al tuo file di revisione per praticare in questa modalità.
            </div>
            <Button variant="secondary" onClick={onBack}>← Torna indietro</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !currentQuestion) return null

  return (
    <div className="page quiz">
      <div className="quiz__topbar">
        <button className="quiz__back" onClick={onBack} aria-label="Indietro">✕</button>
        <ProgressBar current={questionIndex} total={total} />
        <Hearts count={hearts} />
      </div>

      <div className="quiz__body container">
        <div className="quiz__direction-label">
          {DIRECTION_LABELS[currentQuestion.direction]}
        </div>

        <div className="quiz__prompt">
          {currentQuestion.prompt}
        </div>

        {currentQuestion.sourceEntry && (
          <button
            className={`quiz__add-review${addedWords.has(currentQuestion.sourceEntry.italian) ? ' quiz__add-review--added' : ''}`}
            onClick={() => handleAddToReview(currentQuestion.sourceEntry)}
            disabled={addedWords.has(currentQuestion.sourceEntry.italian)}
          >
            {addedWords.has(currentQuestion.sourceEntry.italian) ? '✓ Aggiunta alla revisione' : '+ Aggiungi alla revisione'}
          </button>
        )}

        <div className="quiz__instruction">Seleziona la risposta corretta:</div>

        <div className="quiz__choices">
          {currentQuestion.choices.map((choice, i) => {
            let state = 'idle'
            if (answered) {
              if (choice === currentQuestion.answer) {
                state = 'correct'
              } else if (choice === answered.selected && !answered.correct) {
                state = 'wrong'
              }
            }
            return (
              <AnswerChoice
                key={choice}
                index={i}
                text={choice}
                state={state}
                onClick={() => submitAnswer(choice)}
                disabled={!!answered}
              />
            )
          })}
        </div>
      </div>

      {answered && (
        <FeedbackBar
          correct={answered.correct}
          correctAnswer={currentQuestion.answer}
          onContinue={advance}
        />
      )}
    </div>
  )
}

function FeedbackBar({ correct, correctAnswer, onContinue }) {
  return (
    <div className={`quiz__feedback quiz__feedback--${correct ? 'correct' : 'wrong'}`}>
      <div className="quiz__feedback-inner">
        <div className="quiz__feedback-title">
          {correct ? '✓ Corretto!' : '✗ Risposta sbagliata'}
        </div>
        {!correct && (
          <div className="quiz__feedback-answer">
            Risposta corretta: <strong>{correctAnswer}</strong>
          </div>
        )}
        <Button variant="primary" onClick={onContinue}>
          Continua
        </Button>
      </div>
    </div>
  )
}

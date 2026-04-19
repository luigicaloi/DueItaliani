const LETTERS = ['A', 'B', 'C', 'D']

export default function AnswerChoice({ text, state, onClick, disabled, index }) {
  return (
    <button
      className={`answer-choice ${state !== 'idle' ? `answer-choice--${state}` : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="answer-choice__letter">{LETTERS[index]}</span>
      {text}
    </button>
  )
}

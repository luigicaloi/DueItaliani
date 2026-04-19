import './ModeSelect.css'

const MODES = [
  {
    id: 'duolingo',
    icon: '📚',
    name: 'Practice Duolingo Words',
    desc: 'Review all vocabulary from your lessons',
  },
  {
    id: 'review',
    icon: '⚡',
    name: 'Practice Challenging Words',
    desc: 'Drill the words you find tricky',
  },
  {
    id: 'trip',
    icon: '✈️',
    name: 'Practice Trip Words',
    desc: 'Vocabulary for the Italy trip',
  },
]

export default function ModeSelect({ userId, vocabulary, onSelect, onBack }) {
  const userName = userId === 'luigi' ? 'Luigi' : 'Jasmine'
  const reviewCount = vocabulary.review[userId]?.entries.length ?? 0
  const duolingoCount = (vocabulary.users[userId]?.units ?? [])
    .reduce((n, u) => n + u.entries.length, 0)
  const tripCount = vocabulary.trip.entries.length

  const counts = { duolingo: duolingoCount, review: reviewCount, trip: tripCount }

  return (
    <div className="page mode-select">
      <div className="mode-select__header">
        <button className="mode-select__back" onClick={onBack} aria-label="Indietro">
          ←
        </button>
        <div>
          <div className="mode-select__title">Ciao, {userName}! 👋</div>
          <div className="mode-select__subtitle">Cosa vuoi praticare?</div>
        </div>
      </div>

      <div className="mode-select__cards">
        {MODES.map(mode => (
          <ModeCard
            key={mode.id}
            mode={mode}
            count={counts[mode.id]}
            onClick={() => onSelect(mode.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ModeCard({ mode, count, onClick }) {
  const isEmpty = count === 0

  return (
    <button className="mode-card" onClick={onClick}>
      <div className="mode-card__icon">{mode.icon}</div>
      <div className="mode-card__body">
        <div className="mode-card__name">{mode.name}</div>
        <div className="mode-card__desc">{mode.desc}</div>
      </div>
      {isEmpty ? (
        <span className="mode-card__badge mode-card__badge--empty">Nessuna parola</span>
      ) : (
        <span className="mode-card__badge mode-card__badge--count">{count} words</span>
      )}
      <span className="mode-card__arrow">›</span>
    </button>
  )
}

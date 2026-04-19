import Button from '../shared/Button.jsx'
import './Results.css'

const MAX_HEARTS = 3

export default function Results({ result, onRetry, onHome }) {
  if (!result) return null

  const { score, total, heartsLeft, passed } = result
  const pct = Math.round((score / total) * 100)

  const getMessage = () => {
    if (!passed) return { icon: '💔', title: 'Hai perso tutte le vite!', sub: 'Non mollare — riprova!' }
    if (pct === 100) return { icon: '🏆', title: 'Perfetto!', sub: 'Nessun errore. Fantastico!' }
    if (pct >= 80) return { icon: '🎉', title: 'Ottimo lavoro!', sub: 'Sei sulla buona strada!' }
    if (pct >= 60) return { icon: '👍', title: 'Buon lavoro!', sub: 'Continua a praticare!' }
    return { icon: '💪', title: 'Ci vuole più pratica!', sub: 'Riprova per migliorare.' }
  }

  const { icon, title, sub } = getMessage()

  const heartsDisplay = Array.from({ length: MAX_HEARTS }, (_, i) =>
    i < heartsLeft ? '❤️' : '🖤'
  ).join(' ')

  return (
    <div className="page results">
      <div className="results__icon">{icon}</div>
      <div>
        <div className="results__title">{title}</div>
        <div className="results__subtitle">{sub}</div>
      </div>

      <div className="results__stats">
        <div className={`results__stat ${!passed ? 'results__stat--fail' : ''}`}>
          <div className="results__stat-value">{score}/{total}</div>
          <div className="results__stat-label">Risposte corrette</div>
        </div>
        <div className="results__stat">
          <div className="results__stat-value">{pct}%</div>
          <div className="results__stat-label">Punteggio</div>
        </div>
      </div>

      <div className="results__hearts">{heartsDisplay}</div>

      <div className="results__buttons">
        <Button variant="primary" onClick={onRetry}>
          🔄 Riprova
        </Button>
        <Button variant="secondary" onClick={onHome}>
          🏠 Torna alla home
        </Button>
      </div>
    </div>
  )
}

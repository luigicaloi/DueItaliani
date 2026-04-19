import { useState } from 'react'
import './UserSelect.css'

const USERS = [
  {
    id: 'luigi',
    name: 'Luigi',
    greeting: 'Benvenuto!',
    emoji: '🧑',
    imagePath: '/assets/luigi.png',
  },
  {
    id: 'jasmine',
    name: 'Jasmine',
    greeting: 'Benvenuta!',
    emoji: '👩',
    imagePath: '/assets/jasmine.png',
  },
]

export default function UserSelect({ onSelect }) {
  return (
    <div className="page user-select">
      <div className="logo">
        <span className="logo-text">DueItaliani</span>
      </div>
      <p className="logo-subtitle">Chi pratica oggi?</p>

      <div className="user-select__cards">
        {USERS.map(user => (
          <UserCard key={user.id} user={user} onClick={() => onSelect(user.id)} />
        ))}
      </div>
    </div>
  )
}

function UserCard({ user, onClick }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <button className="user-card" onClick={onClick} aria-label={`Seleziona ${user.name}`}>
      <div className={`user-card__avatar user-card__avatar--${user.id}`}>
        {imgFailed ? (
          <span className="user-card__emoji">{user.emoji}</span>
        ) : (
          <img
            src={user.imagePath}
            alt={user.name}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className="user-card__info">
        <span className="user-card__name">{user.name}</span>
        <span className="user-card__sub">{user.greeting}</span>
      </div>
    </button>
  )
}

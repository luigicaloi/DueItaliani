const MAX_HEARTS = 3

export default function Hearts({ count }) {
  return (
    <div className="hearts" aria-label={`${count} vite rimaste`}>
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <span key={i} className={`heart ${i >= count ? 'heart--lost' : ''}`}>
          ❤️
        </span>
      ))}
    </div>
  )
}

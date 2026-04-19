import './shared.css'

export default function Button({ variant = 'primary', onClick, disabled, children, className = '' }) {
  return (
    <button
      className={`btn btn--${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

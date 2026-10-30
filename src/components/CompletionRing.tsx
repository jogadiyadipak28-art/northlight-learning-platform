export function CompletionRing({
  percent,
  size = 92,
  stroke = 8,
  label,
}: {
  percent: number
  size?: number
  stroke?: number
  label?: string
}) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percent))
  const offset = circ - (clamped / 100) * circ

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-label">
        <strong>{clamped}%</strong>
        {label ? <span>{label}</span> : null}
      </div>
    </div>
  )
}

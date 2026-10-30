import { todayKey } from '../lib/format'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function StreakCalendar({ dates }: { dates: string[] }) {
  const set = new Set(dates)
  const now = new Date()
  const start = startOfMonth(now)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const pad = (start.getDay() + 6) % 7
  const cells: (number | null)[] = [...Array(pad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const today = todayKey(now)
  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <section className="streak-cal panel">
      <header className="side-head">
        <h2>{monthLabel}</h2>
        <span className="muted">Study days</span>
      </header>
      <div className="cal-weekdays">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((day, index) => {
          if (!day) return <span key={`e-${index}`} className="cal-cell empty" />
          const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const active = set.has(key)
          const isToday = key === today
          return (
            <span
              key={key}
              className={`cal-cell ${active ? 'is-on' : ''} ${isToday ? 'is-today' : ''}`}
              title={key}
            >
              {day}
            </span>
          )
        })}
      </div>
      <p className="calendar-help">
        Shaded dates mark days you studied. Opening a lesson or taking a quiz logs the day; consecutive days build your streak.
      </p>
    </section>
  )
}

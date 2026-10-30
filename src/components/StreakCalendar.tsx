import { useMemo, useState } from 'react'
import { todayKey } from '../lib/format'

type ViewMode = 'week' | 'month'

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function dateKey(date: Date) {
  return todayKey(date)
}

function getWeek(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  first.setDate(first.getDate() - ((first.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(first)
    day.setDate(first.getDate() + index)
    return day
  })
}

function getMonthDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: count }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1)),
  ]
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      {direction === 'left' ? <path d="m12.5 4.5-5.5 5.5 5.5 5.5" /> : <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />}
    </svg>
  )
}

export function StreakCalendar({ dates }: { dates: string[] }) {
  const activity = useMemo(() => new Set(dates), [dates])
  const today = todayKey()
  const [selectedKey, setSelectedKey] = useState(today)
  const [view, setView] = useState<ViewMode>('month')
  const selectedDate = dateFromKey(selectedKey)
  const monthLabel = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const weekDays = getWeek(selectedDate)
  const cells = view === 'month' ? getMonthDays(selectedDate) : weekDays
  const periodKey = view === 'month'
    ? `month-${selectedDate.getFullYear()}-${selectedDate.getMonth()}`
    : `week-${dateKey(weekDays[0])}`
  const visibleDates = cells.filter((date): date is Date => date !== null)
  const studyDays = visibleDates.filter((date) => activity.has(dateKey(date))).length
  const selectedIsStudyDay = activity.has(selectedKey)
  const selectedLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const changePeriod = (amount: -1 | 1) => {
    if (view === 'month') {
      setSelectedKey(dateKey(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + amount, 1)))
      return
    }
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + amount * 7)
    setSelectedKey(dateKey(next))
  }

  return (
    <section className="streak-cal panel glass-calendar" aria-labelledby="study-calendar-title">
      <div className="glass-calendar-topline">
        <div className="glass-calendar-heading">
          <p className="glass-calendar-kicker">Your activity</p>
          <h2 id="study-calendar-title">{monthLabel}</h2>
          <p className="glass-calendar-summary">{studyDays} {studyDays === 1 ? 'study day' : 'study days'} in view</p>
        </div>
        <div className="glass-calendar-tools">
          <div className="calendar-view-switch" role="group" aria-label="Calendar view">
            <button type="button" className={view === 'week' ? 'is-active' : ''} aria-pressed={view === 'week'} onClick={() => setView('week')}>Week</button>
            <button type="button" className={view === 'month' ? 'is-active' : ''} aria-pressed={view === 'month'} onClick={() => setView('month')}>Month</button>
          </div>
          <div className="calendar-period-controls">
            <button type="button" onClick={() => changePeriod(-1)} aria-label={view === 'month' ? 'Previous month' : 'Previous week'}><Chevron direction="left" /></button>
            <button type="button" onClick={() => changePeriod(1)} aria-label={view === 'month' ? 'Next month' : 'Next week'}><Chevron direction="right" /></button>
          </div>
        </div>
      </div>

      <div key={periodKey} className={`glass-calendar-grid ${view === 'week' ? 'is-week-view' : ''}`}>
        {view === 'month' ? getMonthDays(selectedDate).map((date, index) => {
          if (!date) return <span key={`empty-${index}`} className="cal-cell empty" aria-hidden="true" />
          const key = dateKey(date)
          const isStudyDay = activity.has(key)
          const isToday = key === today
          const isSelected = key === selectedKey
          const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
          return (
            <button
              key={key}
              type="button"
              className={`cal-cell ${isStudyDay ? 'is-on' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedKey(key)}
              aria-pressed={isSelected}
              aria-label={`${label}${isToday ? ', today' : ''}${isStudyDay ? ', study day' : ', no study logged'}`}
              title={`${key}${isStudyDay ? ' · Study day' : ''}`}
            >
              <span className="cal-day-name">{weekdays[index % 7]}</span>
              <strong>{date.getDate()}</strong>
              {isStudyDay ? <span className="cal-activity-dot" aria-hidden="true" /> : null}
            </button>
          )
        }) : getWeek(selectedDate).map((date) => {
          const key = dateKey(date)
          const isStudyDay = activity.has(key)
          const isToday = key === today
          const isSelected = key === selectedKey
          const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
          return (
            <button
              key={key}
              type="button"
              className={`cal-cell ${isStudyDay ? 'is-on' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedKey(key)}
              aria-pressed={isSelected}
              aria-label={`${label}${isToday ? ', today' : ''}${isStudyDay ? ', study day' : ', no study logged'}`}
              title={`${key}${isStudyDay ? ' · Study day' : ''}`}
            >
              <span className="cal-day-name">{weekdays[(date.getDay() + 6) % 7]}</span>
              <strong>{date.getDate()}</strong>
              {isStudyDay ? <span className="cal-activity-dot" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>

      <div className="calendar-selected-day" aria-live="polite">
        <span className={`calendar-status-dot ${selectedIsStudyDay ? 'is-on' : ''}`} aria-hidden="true" />
        <strong>{selectedLabel}</strong>
        <span>{selectedIsStudyDay ? 'Study activity recorded' : 'No study activity logged'}</span>
      </div>
      <p className="calendar-help">Shaded days mark lessons or quizzes you worked on. Keep a steady rhythm to build your streak.</p>
      <button type="button" className="calendar-today-button" onClick={() => setSelectedKey(today)}>Back to today</button>
    </section>
  )
}

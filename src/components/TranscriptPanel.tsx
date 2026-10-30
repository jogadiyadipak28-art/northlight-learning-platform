import { useEffect, useRef } from 'react'
import type { TranscriptLine } from '../types'
import { formatTime } from '../lib/format'

export function TranscriptPanel({
  lines,
  currentTime,
  onJump,
}: {
  lines: TranscriptLine[]
  currentTime: number
  onJump: (seconds: number) => void
}) {
  const active = lines.find((line) => currentTime >= line.start && currentTime < line.end)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [active?.start])

  return (
    <section className="side-panel">
      <header className="side-head">
        <h2>Transcript</h2>
      </header>
      <div className="transcript">
        {lines.map((line) => {
          const isActive = active?.start === line.start
          return (
            <button
              key={`${line.start}-${line.text}`}
              type="button"
              ref={isActive ? activeRef : undefined}
              className={`t-line ${isActive ? 'is-active' : ''}`}
              onClick={() => onJump(line.start)}
            >
              <span>{formatTime(line.start)}</span>
              {line.text}
            </button>
          )
        })}
      </div>
    </section>
  )
}

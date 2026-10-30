import { useState } from 'react'
import type { Note } from '../types'
import { formatTime } from '../lib/format'
import { EmptyState } from './Skeleton'

export function NotesPanel({
  notes,
  currentTime,
  onAdd,
  onRemove,
  onJump,
}: {
  notes: Note[]
  currentTime: number
  onAdd: (text: string, seconds: number) => void
  onRemove: (id: string) => void
  onJump: (seconds: number) => void
}) {
  const [text, setText] = useState('')

  return (
    <section className="side-panel">
      <header className="side-head">
        <h2>Notes</h2>
        <span className="muted">{formatTime(currentTime)}</span>
      </header>
      <form
        className="note-form"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = text.trim()
          if (!trimmed) return
          onAdd(trimmed, currentTime)
          setText('')
        }}
      >
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Pin a thought to this moment…"
          rows={3}
        />
        <button type="submit" className="btn">
          Save at {formatTime(currentTime)}
        </button>
      </form>
      {notes.length === 0 ? (
        <EmptyState title="No notes yet" body="Pause when something lands, then pin it to the timestamp." />
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id}>
              <button type="button" className="note-jump" onClick={() => onJump(note.seconds)}>
                {formatTime(note.seconds)}
              </button>
              <p>{note.text}</p>
              <button type="button" className="text-btn" onClick={() => onRemove(note.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

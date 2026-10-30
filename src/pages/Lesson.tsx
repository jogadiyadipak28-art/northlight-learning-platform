import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLesson } from '../data/courses'
import { VideoPlayer } from '../components/VideoPlayer'
import { NotesPanel } from '../components/NotesPanel'
import { TranscriptPanel } from '../components/TranscriptPanel'
import { useProgress } from '../context/ProgressContext'
import { courseProgressOf } from '../lib/progress'
import { isYouTubeVideo } from '../components/YouTubePlayer'

export function LessonPage() {
  const { slug, lessonId } = useParams()
  const found = slug && lessonId ? getLesson(slug, lessonId) : null
  const { state, touchCourse, savePosition, completeLesson, addNote, removeNote } = useProgress()
  const [time, setTime] = useState(0)
  const [captionsOn, setCaptionsOn] = useState(true)
  const [seekTo, setSeekTo] = useState<number | null>(null)
  const lastSaved = useRef(0)
  const currentTime = useRef(0)

  useEffect(() => {
    if (!slug || !lessonId) return
    const match = getLesson(slug, lessonId)
    if (match) touchCourse(match.course.id)
  }, [slug, lessonId, touchCourse])

  const progress = found ? courseProgressOf(state, found.course.id) : null
  const startAt = found && progress ? progress.lessonPositions[found.lesson.id] ?? 0 : 0
  const notes = found && progress ? progress.notes.filter((note) => note.lessonId === found.lesson.id) : []

  useEffect(() => {
    if (!found) return
    const flushPosition = () => {
      if (currentTime.current > 0) {
        savePosition(found.course.id, found.lesson.id, currentTime.current)
      }
    }
    window.addEventListener('pagehide', flushPosition)
    return () => {
      window.removeEventListener('pagehide', flushPosition)
      flushPosition()
    }
  }, [found?.course.id, found?.lesson.id, savePosition])

  const captionText = useMemo(() => {
    if (!found) return ''
    return found.lesson.transcript.find((line) => time >= line.start && time < line.end)?.text ?? ''
  }, [found, time])

  if (!found) {
    return (
      <main className="page">
        <p className="empty-title">Lesson missing</p>
        <Link to="/" className="btn">
          Catalog
        </Link>
      </main>
    )
  }

  const { course, lesson } = found
  const index = course.lessons.findIndex((item) => item.id === lesson.id)
  const prev = course.lessons[index - 1]
  const next = course.lessons[index + 1]

  return (
    <main className="page lesson-page">
      <div className="crumb">
        <Link to={`/course/${course.slug}`}>{course.title}</Link>
        <span> / {lesson.title}</span>
      </div>
      <div className="player-toolbar">
        <h1>{lesson.title}</h1>
        <div className="toolbar-actions">
          {isYouTubeVideo(lesson.videoUrl) ? (
            <span className="muted captions-note">Use CC in the video controls for captions</span>
          ) : (
            <label className="toggle">
              <input type="checkbox" checked={captionsOn} onChange={(event) => setCaptionsOn(event.target.checked)} />
              Captions
            </label>
          )}
          {progress?.completedLessonIds.includes(lesson.id) ? (
            <span className="muted">Lesson complete</span>
          ) : (
            <button type="button" className="btn ghost" onClick={() => completeLesson(course, lesson.id)}>
              Mark complete
            </button>
          )}
        </div>
      </div>
      <VideoPlayer
        lesson={lesson}
        startAt={startAt}
        seekTo={seekTo}
        captionsOn={captionsOn}
        captionText={captionText}
        onTime={(seconds) => {
          currentTime.current = seconds
          setTime(seconds)
          if (seconds - lastSaved.current > 2 || lastSaved.current - seconds > 2) {
            lastSaved.current = seconds
            savePosition(course.id, lesson.id, seconds)
          }
        }}
        onComplete={() => completeLesson(course, lesson.id)}
      />
      <p className="lesson-sum">{lesson.summary}</p>
      <div className="lesson-nav">
        {prev ? (
          <Link to={`/course/${course.slug}/lesson/${prev.id}`}>← {prev.title}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/course/${course.slug}/lesson/${next.id}`}>{next.title} →</Link>
        ) : (
          <Link to={`/course/${course.slug}/quiz`}>Take the quiz →</Link>
        )}
      </div>
      <div className="panels">
        <NotesPanel
          notes={notes}
          currentTime={time}
          onJump={(seconds) => setSeekTo(seconds + Math.random() * 0.0001)}
          onAdd={(text, seconds) =>
            addNote(course.id, {
              id: crypto.randomUUID(),
              lessonId: lesson.id,
              seconds,
              text,
              createdAt: new Date().toISOString(),
            })
          }
          onRemove={(id) => removeNote(course.id, id)}
        />
        <TranscriptPanel
          lines={lesson.transcript}
          currentTime={time}
          onJump={(seconds) => setSeekTo(seconds + Math.random() * 0.0001)}
        />
      </div>
    </main>
  )
}

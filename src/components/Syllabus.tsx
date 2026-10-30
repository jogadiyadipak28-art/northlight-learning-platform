import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Course } from '../types'
import { formatTime } from '../lib/format'
import { isYouTubeVideo } from './YouTubePlayer'

export function Syllabus({
  course,
  completedLessonIds,
}: {
  course: Course
  completedLessonIds: string[]
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="accordion">
      <button type="button" className="acc-trigger" onClick={() => setOpen((value) => !value)}>
        <span>Syllabus</span>
        <span className="muted">
          {completedLessonIds.length}/{course.lessons.length} lessons · {open ? 'Hide' : 'Show'}
        </span>
      </button>
      {open ? (
        <ol className="syllabus">
          {course.lessons.map((lesson, index) => {
            const done = completedLessonIds.includes(lesson.id)
            return (
              <li key={lesson.id}>
                <Link to={`/course/${course.slug}/lesson/${lesson.id}`}>
                  <span className="idx">{String(index + 1).padStart(2, '0')}</span>
                  <span>
                    <strong>{lesson.title}</strong>
                    <em>{lesson.summary}</em>
                  </span>
                  <span className="muted">
                    {done ? 'Done · ' : ''}
                    {isYouTubeVideo(lesson.videoUrl) ? 'Video lesson' : formatTime(lesson.durationSec)}
                  </span>
                </Link>
              </li>
            )
          })}
          <li>
            <Link to={`/course/${course.slug}/quiz`}>
              <span className="idx">Q</span>
              <span>
                <strong>{course.quiz.title}</strong>
                <em>Timed checkpoint · {course.quiz.questions.length} questions</em>
              </span>
              <span className="muted">{formatTime(course.quiz.timeLimitSec)}</span>
            </Link>
          </li>
        </ol>
      ) : null}
    </div>
  )
}

export function InstructorCard({ course }: { course: Course }) {
  const { instructor } = course
  return (
    <aside className="instructor">
      <div className="avatar" style={{ background: course.accent }}>
        {instructor.initials}
      </div>
      <div>
        <p className="eyebrow">Instructor</p>
        <h2>{instructor.name}</h2>
        <p className="muted">{instructor.title}</p>
        <p>{instructor.bio}</p>
      </div>
    </aside>
  )
}

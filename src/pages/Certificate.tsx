import { Link, useParams } from 'react-router-dom'
import { getCourse } from '../data/courses'
import { useProgress } from '../context/ProgressContext'
import { courseProgressOf, isCourseComplete } from '../lib/progress'
import { EmptyState } from '../components/Skeleton'

export function CertificatePage() {
  const { slug } = useParams()
  const course = slug ? getCourse(slug) : undefined
  const { state } = useProgress()

  if (!course) {
    return (
      <main className="page">
        <EmptyState title="Unknown course" body="There is no certificate for a missing syllabus." />
      </main>
    )
  }

  const progress = courseProgressOf(state, course.id)
  const ready = isCourseComplete(course, progress)
  const date = progress.completedAt
    ? new Date(progress.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  if (!ready) {
    return (
      <main className="page">
        <EmptyState
          title="Not finished"
          body="Complete every lesson and pass the quiz to print a certificate."
        />
        <Link to={`/course/${course.slug}`} className="btn">
          Back to course
        </Link>
      </main>
    )
  }

  return (
    <main className="page cert-page">
      <div className="cert-actions no-print">
        <Link to={`/course/${course.slug}`}>Back</Link>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print
        </button>
      </div>
      <article className="certificate">
        <p className="cert-brand">Northlight Atelier</p>
        <p className="eyebrow">Certificate of completion</p>
        <h1>{state.learnerName}</h1>
        <p className="cert-copy">has completed the course</p>
        <h2>{course.title}</h2>
        <p className="muted">
          {course.lessons.length} lessons · {course.quiz.title} passed · {date}
        </p>
        <div className="cert-sign">
          <span>{course.instructor.name}</span>
          <em>Instructor</em>
        </div>
      </article>
    </main>
  )
}

import { Link, useParams } from 'react-router-dom'
import { getCourse } from '../data/courses'
import { InstructorCard, Syllabus } from '../components/Syllabus'
import { CompletionRing } from '../components/CompletionRing'
import { useProgress } from '../context/ProgressContext'
import { courseProgressOf, isCourseComplete, overallPercent } from '../lib/progress'
import { formatHours } from '../lib/format'

export function CourseDetail() {
  const { slug } = useParams()
  const course = slug ? getCourse(slug) : undefined
  const { state, enroll } = useProgress()

  if (!course) {
    return (
      <main className="page">
        <p className="empty-title">Course missing</p>
        <p>That syllabus was never bound. Return to the catalog.</p>
        <Link to="/" className="btn">
          Catalog
        </Link>
      </main>
    )
  }

  const progress = courseProgressOf(state, course.id)
  const percent = overallPercent(course, progress)
  const complete = isCourseComplete(course, progress)
  const nextLesson =
    course.lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? course.lessons[0]
  const continueHref = `/course/${course.slug}/lesson/${nextLesson.id}`

  return (
    <main className="page detail">
      <div className="detail-hero" style={{ backgroundImage: `url(${course.cover})` }}>
        <div className="detail-hero-inner">
          <p className="eyebrow">
            {course.category} · {course.level}
          </p>
          <h1>{course.title}</h1>
          <p className="lede">{course.subtitle}</p>
          <p className="muted">
            {formatHours(course.hours)} · {course.lessons.length} lessons · {course.students.toLocaleString()} learners
            · updated {course.updatedAt}
          </p>
          <div className="hero-actions">
            <Link
              className="btn"
              to={continueHref}
              onClick={() => enroll(course.id)}
            >
              {progress.enrolled || percent > 0 ? 'Continue' : 'Start learning'}
            </Link>
            <Link className="btn ghost" to={`/course/${course.slug}/quiz`}>
              Take quiz
            </Link>
            {complete ? (
              <Link className="btn ghost" to={`/course/${course.slug}/certificate`}>
                Certificate
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <p>{course.description}</p>
          <Syllabus course={course} completedLessonIds={progress.completedLessonIds} />
        </div>
        <div className="detail-side">
          <div className="panel center">
            <CompletionRing percent={percent} label="complete" />
          </div>
          <InstructorCard course={course} />
        </div>
      </div>
    </main>
  )
}

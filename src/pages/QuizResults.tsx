import { Link, useParams } from 'react-router-dom'
import { getCourse } from '../data/courses'
import { useProgress } from '../context/ProgressContext'
import { courseProgressOf } from '../lib/progress'
import { EmptyState } from '../components/Skeleton'

export function QuizResults() {
  const { slug, attemptId } = useParams()
  const course = slug ? getCourse(slug) : undefined
  const { state } = useProgress()

  if (!course) {
    return (
      <main className="page">
        <EmptyState title="Course missing" body="This quiz result has no syllabus behind it." />
      </main>
    )
  }

  const progress = courseProgressOf(state, course.id)
  const attempt = progress.quizAttempts.find((item) => item.id === attemptId)

  if (!attempt) {
    return (
      <main className="page">
        <EmptyState title="Result expired" body="That attempt is not in this browser’s memory." />
        <Link to={`/course/${course.slug}/quiz`} className="btn">
          Retake
        </Link>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="crumb">
        <Link to={`/course/${course.slug}`}>{course.title}</Link>
        <span> / Results</span>
      </div>
      <section className="quiz-card">
        <p className="eyebrow">{attempt.passed ? 'Passed' : 'Not yet'}</p>
        <h1>
          {attempt.scorePercent}% · {attempt.answers.filter((a) => a.correct).length}/
          {course.quiz.questions.length} correct
        </h1>
        <p className="muted">
          Pass mark {course.quiz.passPercent}%. Time left {Math.max(0, attempt.remainingSec)}s.
        </p>
        <div className="hero-actions">
          <Link className="btn" to={`/course/${course.slug}/quiz`}>
            Retake quiz
          </Link>
          <Link className="btn ghost" to={`/course/${course.slug}`}>
            Back to course
          </Link>
          {attempt.passed && progress.completedAt ? (
            <Link className="btn ghost" to={`/course/${course.slug}/certificate`}>
              Certificate
            </Link>
          ) : null}
        </div>
      </section>
      <ol className="breakdown">
        {course.quiz.questions.map((question, index) => {
          const answer = attempt.answers.find((item) => item.questionId === question.id)
          const selectedText =
            question.type === 'order'
              ? (answer?.selectedIds ?? []).map((id) => question.items.find((item) => item.id === id)?.text)
              : (answer?.selectedIds ?? []).map((id) => question.options.find((option) => option.id === id)?.text)
          const correctText =
            question.type === 'order'
              ? question.correctOrder.map((id) => question.items.find((item) => item.id === id)?.text)
              : question.correctIds.map((id) => question.options.find((option) => option.id === id)?.text)
          return (
            <li key={question.id} className={answer?.correct ? 'ok' : 'no'}>
              <p>
                <strong>
                  {index + 1}. {question.prompt}
                </strong>
              </p>
              <p className="muted">{answer?.correct ? 'Correct' : 'Incorrect or skipped'}</p>
              <p>
                <strong>Your answer:</strong>{' '}
                {selectedText.filter(Boolean).length ? selectedText.filter(Boolean).join(' → ') : 'No answer'}
              </p>
              {!answer?.correct ? (
                <p>
                  <strong>Correct answer:</strong> {correctText.filter(Boolean).join(' → ')}
                </p>
              ) : null}
              <p>{question.explanation}</p>
            </li>
          )
        })}
      </ol>
    </main>
  )
}

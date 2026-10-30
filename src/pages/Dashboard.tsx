import { Link } from 'react-router-dom'
import { courses } from '../data/courses'
import { CompletionRing } from '../components/CompletionRing'
import { StreakCalendar } from '../components/StreakCalendar'
import { EmptyState } from '../components/Skeleton'
import { useProgress } from '../context/ProgressContext'
import { courseProgressOf, currentStreak, overallPercent } from '../lib/progress'

export function Dashboard() {
  const { state, setLearnerName } = useProgress()
  const streak = currentStreak(state.activityDates)

  const inProgress = courses
    .map((course) => ({
      course,
      progress: courseProgressOf(state, course.id),
      percent: overallPercent(course, courseProgressOf(state, course.id)),
    }))
    .filter((row) => row.progress.enrolled || row.percent > 0)
    .sort((a, b) => (b.progress.lastAccessedAt ?? '').localeCompare(a.progress.lastAccessedAt ?? ''))

  const continueRow = inProgress.filter((row) => !row.progress.completedAt)
  const completed = inProgress.filter((row) => row.progress.completedAt)

  return (
    <main className="page dash">
      <section className="hero">
        <p className="eyebrow">Your desk</p>
        <h1>Progress</h1>
        <label className="name-field">
          Name on certificates
          <input
            value={state.learnerName}
            onChange={(event) => setLearnerName(event.target.value)}
            maxLength={80}
          />
        </label>
      </section>

      <div className="dash-top">
        <div className="panel streak-stat glass-streak">
          <p className="eyebrow">Streak</p>
          <p className="big">{streak}</p>
          <p className="muted">{streak === 1 ? 'day' : 'days'} in a row</p>
        </div>
        <StreakCalendar dates={state.activityDates} />
      </div>

      <section>
        <h2 className="section-title">Continue learning</h2>
        {continueRow.length === 0 ? (
          <EmptyState title="No unfinished work" body="Open a course from the catalog and your place will wait here." />
        ) : (
          <div className="continue-row">
            {continueRow.map(({ course, progress, percent }) => {
              const next =
                course.lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ??
                course.lessons[0]
              return (
                <Link key={course.id} to={`/course/${course.slug}/lesson/${next.id}`} className="continue-card">
                  <div className="cover mini" style={{ backgroundImage: `url(${course.cover})` }} />
                  <div>
                    <h3>{course.title}</h3>
                    <p className="muted">Next: {next.title}</p>
                  </div>
                  <CompletionRing percent={percent} size={64} stroke={6} />
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">All enrolled</h2>
        {inProgress.length === 0 ? (
          <EmptyState title="Nothing enrolled yet" body="The catalog is the front door." />
        ) : (
          <div className="enrolled-list">
            {inProgress.map(({ course, percent, progress }) => (
              <Link key={course.id} to={`/course/${course.slug}`} className="enrolled-row">
                <CompletionRing percent={percent} size={72} stroke={7} />
                <div>
                  <h3>{course.title}</h3>
                  <p className="muted">
                    {progress.completedLessonIds.length}/{course.lessons.length} lessons
                    {progress.completedAt ? ' · Certificate ready' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 ? (
        <section>
          <h2 className="section-title">Certificates</h2>
          <ul className="cert-links">
            {completed.map(({ course }) => (
              <li key={course.id}>
                <Link to={`/course/${course.slug}/certificate`}>{course.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}

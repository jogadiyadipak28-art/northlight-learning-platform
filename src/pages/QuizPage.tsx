import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCourse } from '../data/courses'
import { QuizEngine, unansweredRest } from '../components/QuizEngine'
import { useProgress } from '../context/ProgressContext'
import type { QuizAnswer } from '../types'

export function QuizPage() {
  const { slug } = useParams()
  const course = slug ? getCourse(slug) : undefined
  const { recordAttempt } = useProgress()
  const navigate = useNavigate()
  const [remaining, setRemaining] = useState(course?.quiz.timeLimitSec ?? 0)
  const [started, setStarted] = useState(false)
  const startedAtRef = useRef<string | null>(null)
  const answersRef = useRef<QuizAnswer[]>([])
  const doneRef = useRef(false)

  useEffect(() => {
    if (!course || !started) return
    const id = window.setInterval(() => {
      setRemaining((sec) => {
        if (sec <= 1) {
          window.clearInterval(id)
          finish(unansweredRest(course.quiz, answersRef.current), 0)
          return 0
        }
        return sec - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [started, course])

  if (!course) {
    return (
      <main className="page">
        <p className="empty-title">Quiz missing</p>
        <Link to="/" className="btn">
          Catalog
        </Link>
      </main>
    )
  }

  function finish(answers: QuizAnswer[], remainingSec: number) {
    if (!course || doneRef.current) return
    doneRef.current = true
    const scored = unansweredRest(course.quiz, answers)
    const correct = scored.filter((answer) => answer.correct).length
    const scorePercent = Math.round((correct / course.quiz.questions.length) * 100)
    const attempt = {
      id: crypto.randomUUID(),
      quizId: course.quiz.id,
      startedAt: startedAtRef.current ?? new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      scorePercent,
      passed: scorePercent >= course.quiz.passPercent,
      answers: scored,
      remainingSec,
    }
    recordAttempt(course, attempt)
    navigate(`/course/${course.slug}/quiz/results/${attempt.id}`)
  }

  return (
    <main className="page quiz-page">
      <div className="crumb">
        <Link to={`/course/${course.slug}`}>{course.title}</Link>
        <span> / {course.quiz.title}</span>
      </div>
      {!started ? (
        <div className="quiz-card">
          <p className="eyebrow">Checkpoint</p>
          <h1>{course.quiz.title}</h1>
          <p>
            {course.quiz.questions.length} questions · {Math.round(course.quiz.timeLimitSec / 60)} minute timer · pass
            at {course.quiz.passPercent}%. Instant feedback after each check. You can retake from the results page.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              startedAtRef.current = new Date().toISOString()
              setStarted(true)
            }}
          >
            Begin
          </button>
        </div>
      ) : (
        <QuizEngine
          quiz={course.quiz}
          remainingSec={remaining}
          onDraft={(answers) => {
            answersRef.current = answers
          }}
          onFinish={(answers, remainingSec) => {
            answersRef.current = answers
            finish(answers, remainingSec)
          }}
        />
      )}
    </main>
  )
}

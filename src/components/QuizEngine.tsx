import { useMemo, useState } from 'react'
import type { Quiz, QuizAnswer, QuizQuestion } from '../types'
import { arraysEqual, formatTime, setsEqual, shuffle } from '../lib/format'

type Props = {
  quiz: Quiz
  remainingSec: number
  onFinish: (answers: QuizAnswer[], remainingSec: number) => void
  onDraft?: (answers: QuizAnswer[]) => void
}

function grade(question: QuizQuestion, selectedIds: string[]): boolean {
  if (question.type === 'single') return setsEqual(selectedIds, question.correctIds)
  if (question.type === 'multi') return setsEqual(selectedIds, question.correctIds)
  return arraysEqual(selectedIds, question.correctOrder)
}

export function QuizEngine({ quiz, remainingSec, onFinish, onDraft }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const question = quiz.questions[index]
  const orderItems = useMemo(() => {
    if (question.type !== 'order') return []
    return shuffle(question.items)
  }, [question])

  const [order, setOrder] = useState<string[]>([])
  const liveOrder = question.type === 'order' ? (order.length ? order : orderItems.map((item) => item.id)) : selected

  const lockIn = () => {
    const chosen = question.type === 'order' ? liveOrder : selected
    const correct = grade(question, chosen)
    const nextAnswers = [
      ...answers.filter((answer) => answer.questionId !== question.id),
      { questionId: question.id, selectedIds: chosen, correct },
    ]
    setAnswers(nextAnswers)
    onDraft?.(nextAnswers)
    setFeedback(correct)
    return nextAnswers
  }

  const goNext = (nextAnswers: QuizAnswer[]) => {
    if (index + 1 >= quiz.questions.length) {
      onFinish(nextAnswers, remainingSec)
      return
    }
    setIndex(index + 1)
    setSelected([])
    setOrder([])
    setFeedback(null)
  }

  const toggle = (id: string) => {
    if (feedback !== null) return
    if (question.type === 'single') setSelected([id])
    else
      setSelected((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      )
  }

  const move = (from: number, to: number) => {
    if (feedback !== null) return
    const next = [...liveOrder]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setOrder(next)
  }

  return (
    <div className="quiz-card">
      <div className="quiz-meta">
        <span>
          Question {index + 1} of {quiz.questions.length}
        </span>
        <span className={`timer ${remainingSec < 30 ? 'warn' : ''}`}>{formatTime(remainingSec)}</span>
      </div>
      <h1>{question.prompt}</h1>
      <p className="muted">
        {question.type === 'single' && 'Choose one.'}
        {question.type === 'multi' && 'Select every answer that applies.'}
        {question.type === 'order' && 'Drag to put these in order, or use the arrows.'}
      </p>

      {question.type !== 'order' ? (
        <ul className="choices">
          {question.options.map((option) => {
            const on = selected.includes(option.id)
            const isCorrect = question.correctIds.includes(option.id)
            const show = feedback !== null
            return (
              <li key={option.id}>
                <button
                  type="button"
                  className={`choice ${on ? 'is-on' : ''} ${show && isCorrect ? 'is-right' : ''} ${show && on && !isCorrect ? 'is-wrong' : ''}`}
                  onClick={() => toggle(option.id)}
                >
                  {option.text}
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="order-list">
          {liveOrder.map((id, itemIndex) => {
            const item = question.items.find((entry) => entry.id === id)!
            const rightPlace = feedback !== null && question.correctOrder[itemIndex] === id
            const wrongPlace = feedback !== null && !rightPlace
            return (
              <li
                key={id}
                className={`order-item ${rightPlace ? 'is-right' : ''} ${wrongPlace ? 'is-wrong' : ''}`}
                draggable={feedback === null}
                onDragStart={(event) => event.dataTransfer.setData('text/plain', String(itemIndex))}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  move(Number(event.dataTransfer.getData('text/plain')), itemIndex)
                }}
              >
                <span className="grip" aria-hidden="true">
                  ∷
                </span>
                <span>{item.text}</span>
                <span className="order-btns">
                  <button type="button" disabled={itemIndex === 0} onClick={() => move(itemIndex, itemIndex - 1)}>
                    Up
                  </button>
                  <button
                    type="button"
                    disabled={itemIndex === liveOrder.length - 1}
                    onClick={() => move(itemIndex, itemIndex + 1)}
                  >
                    Down
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {feedback !== null ? (
        <div className={`feedback ${feedback ? 'ok' : 'no'}`}>
          <strong>{feedback ? 'That’s it.' : 'Not quite.'}</strong>
          <p>{question.explanation}</p>
        </div>
      ) : null}

      <div className="quiz-actions">
        {feedback === null ? (
          <button
            type="button"
            className="btn"
            disabled={question.type !== 'order' && selected.length === 0}
            onClick={() => lockIn()}
          >
            Check answer
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => goNext(answers)}>
            {index + 1 >= quiz.questions.length ? 'See results' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}

export function unansweredRest(quiz: Quiz, answers: QuizAnswer[]): QuizAnswer[] {
  return quiz.questions.map((question) => {
    const existing = answers.find((answer) => answer.questionId === question.id)
    if (existing) return existing
    return { questionId: question.id, selectedIds: [], correct: false }
  })
}

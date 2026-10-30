import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react'
import type { Course, Note, ProgressState, QuizAttempt } from '../types'
import {
  courseProgressOf,
  emptyCourseProgress,
  isCourseComplete,
  loadProgress,
  saveProgress,
  withActivity,
} from '../lib/progress'

let snapshot = loadProgress()
const listeners = new Set<() => void>()

function emit() {
  saveProgress(snapshot)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

function update(mutator: (state: ProgressState) => ProgressState) {
  snapshot = mutator(snapshot)
  emit()
}

function patchCourse(
  courseId: string,
  mutator: (progress: ReturnType<typeof emptyCourseProgress>) => ReturnType<typeof emptyCourseProgress>,
) {
  update((state) => {
    const current = courseProgressOf(state, courseId)
    return {
      ...state,
      activityDates: withActivity(state.activityDates),
      courses: {
        ...state.courses,
        [courseId]: mutator({ ...current }),
      },
    }
  })
}

type ProgressApi = {
  state: ProgressState
  setLearnerName: (name: string) => void
  enroll: (courseId: string) => void
  touchCourse: (courseId: string) => void
  savePosition: (courseId: string, lessonId: string, seconds: number) => void
  completeLesson: (course: Course, lessonId: string) => void
  addNote: (courseId: string, note: Note) => void
  removeNote: (courseId: string, noteId: string) => void
  recordAttempt: (course: Course, attempt: QuizAttempt) => void
}

const ProgressContext = createContext<ProgressApi | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const setLearnerName = useCallback((name: string) => {
    update((current) => ({ ...current, learnerName: name }))
  }, [])

  const enroll = useCallback((courseId: string) => {
    patchCourse(courseId, (progress) => ({
      ...progress,
      enrolled: true,
      lastAccessedAt: new Date().toISOString(),
    }))
  }, [])

  const touchCourse = useCallback((courseId: string) => {
    patchCourse(courseId, (progress) => ({
      ...progress,
      enrolled: true,
      lastAccessedAt: new Date().toISOString(),
    }))
  }, [])

  const savePosition = useCallback((courseId: string, lessonId: string, seconds: number) => {
    const current = courseProgressOf(snapshot, courseId)
    snapshot = {
      ...snapshot,
      courses: {
        ...snapshot.courses,
        [courseId]: {
          ...current,
          enrolled: true,
          lessonPositions: { ...current.lessonPositions, [lessonId]: seconds },
        },
      },
    }
    saveProgress(snapshot)
  }, [])

  const completeLesson = useCallback((course: Course, lessonId: string) => {
    patchCourse(course.id, (progress) => {
      const completedLessonIds = progress.completedLessonIds.includes(lessonId)
        ? progress.completedLessonIds
        : [...progress.completedLessonIds, lessonId]
      const next = { ...progress, completedLessonIds, enrolled: true, lastAccessedAt: new Date().toISOString() }
      if (isCourseComplete(course, next) && !next.completedAt) {
        next.completedAt = new Date().toISOString()
      }
      return next
    })
  }, [])

  const addNote = useCallback((courseId: string, note: Note) => {
    patchCourse(courseId, (progress) => ({
      ...progress,
      notes: [...progress.notes, note],
    }))
  }, [])

  const removeNote = useCallback((courseId: string, noteId: string) => {
    patchCourse(courseId, (progress) => ({
      ...progress,
      notes: progress.notes.filter((note) => note.id !== noteId),
    }))
  }, [])

  const recordAttempt = useCallback((course: Course, attempt: QuizAttempt) => {
    patchCourse(course.id, (progress) => {
      const next = {
        ...progress,
        enrolled: true,
        quizAttempts: [...progress.quizAttempts, attempt],
        lastAccessedAt: new Date().toISOString(),
      }
      if (isCourseComplete(course, next) && !next.completedAt) {
        next.completedAt = new Date().toISOString()
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      state,
      setLearnerName,
      enroll,
      touchCourse,
      savePosition,
      completeLesson,
      addNote,
      removeNote,
      recordAttempt,
    }),
    [
      state,
      setLearnerName,
      enroll,
      touchCourse,
      savePosition,
      completeLesson,
      addNote,
      removeNote,
      recordAttempt,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}

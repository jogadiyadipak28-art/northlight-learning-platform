import type { Course, CourseProgress, ProgressState } from '../types'
import { todayKey } from './format'

export const STORAGE_KEY = 'northlight-progress-v1'

export function emptyCourseProgress(): CourseProgress {
  return {
    enrolled: false,
    lastAccessedAt: null,
    completedLessonIds: [],
    lessonPositions: {},
    notes: [],
    quizAttempts: [],
    completedAt: null,
  }
}

export const defaultProgress = (): ProgressState => ({
  learnerName: 'Alex Rivera',
  activityDates: [],
  courses: {},
})

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as ProgressState
    return {
      ...defaultProgress(),
      ...parsed,
      courses: parsed.courses ?? {},
      activityDates: parsed.activityDates ?? [],
    }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function courseProgressOf(state: ProgressState, courseId: string): CourseProgress {
  return state.courses[courseId] ?? emptyCourseProgress()
}

export function lessonPercent(course: Course, progress: CourseProgress): number {
  if (course.lessons.length === 0) return 0
  return Math.round((progress.completedLessonIds.length / course.lessons.length) * 100)
}

export function overallPercent(course: Course, progress: CourseProgress): number {
  const lessonShare = 0.8
  const quizShare = 0.2
  const lessons = lessonPercent(course, progress) / 100
  const passed = progress.quizAttempts.some((attempt) => attempt.passed)
  return Math.round((lessons * lessonShare + (passed ? quizShare : 0)) * 100)
}

export function isCourseComplete(course: Course, progress: CourseProgress): boolean {
  const allLessons = course.lessons.every((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  )
  const passed = progress.quizAttempts.some((attempt) => attempt.passed)
  return allLessons && passed
}

export function withActivity(dates: string[]): string[] {
  const today = todayKey()
  if (dates.includes(today)) return dates
  return [...dates, today].sort()
}

export function currentStreak(dates: string[]): number {
  const set = new Set(dates)
  let streak = 0
  const cursor = new Date()
  if (!set.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!set.has(todayKey(cursor))) return 0
  }
  while (set.has(todayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

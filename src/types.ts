export type Level = 'Beginner' | 'Intermediate' | 'Advanced'
export type Category = 'Craft' | 'Film' | 'Design' | 'Audio' | 'Writing'

export type TranscriptLine = {
  start: number
  end: number
  text: string
}

export type Lesson = {
  id: string
  title: string
  durationSec: number
  videoUrl: string
  poster: string
  summary: string
  transcript: TranscriptLine[]
}

export type ChoiceOption = { id: string; text: string }

export type QuizQuestion =
  | {
      id: string
      type: 'single'
      prompt: string
      options: ChoiceOption[]
      correctIds: string[]
      explanation: string
    }
  | {
      id: string
      type: 'multi'
      prompt: string
      options: ChoiceOption[]
      correctIds: string[]
      explanation: string
    }
  | {
      id: string
      type: 'order'
      prompt: string
      items: ChoiceOption[]
      correctOrder: string[]
      explanation: string
    }

export type Quiz = {
  id: string
  title: string
  timeLimitSec: number
  passPercent: number
  questions: QuizQuestion[]
}

export type Instructor = {
  name: string
  title: string
  bio: string
  initials: string
}

export type Course = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  category: Category
  level: Level
  hours: number
  students: number
  rating: number
  updatedAt: string
  cover: string
  accent: string
  instructor: Instructor
  lessons: Lesson[]
  quiz: Quiz
}

export type Note = {
  id: string
  lessonId: string
  seconds: number
  text: string
  createdAt: string
}

export type QuizAnswer = {
  questionId: string
  selectedIds: string[]
  correct: boolean
}

export type QuizAttempt = {
  id: string
  quizId: string
  startedAt: string
  finishedAt: string
  scorePercent: number
  passed: boolean
  answers: QuizAnswer[]
  remainingSec: number
}

export type CourseProgress = {
  enrolled: boolean
  lastAccessedAt: string | null
  completedLessonIds: string[]
  lessonPositions: Record<string, number>
  notes: Note[]
  quizAttempts: QuizAttempt[]
  completedAt: string | null
}

export type ProgressState = {
  learnerName: string
  activityDates: string[]
  courses: Record<string, CourseProgress>
}

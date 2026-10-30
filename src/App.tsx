import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext'
import { Layout } from './components/Layout'
import { Catalog } from './pages/Catalog'
import { HomePage } from './pages/HomePage'
import { CourseDetail } from './pages/CourseDetail'
import { LessonPage } from './pages/Lesson'
import { QuizPage } from './pages/QuizPage'
import { QuizResults } from './pages/QuizResults'
import { Dashboard } from './pages/Dashboard'
import { CertificatePage } from './pages/Certificate'

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course/:slug" element={<CourseDetail />} />
            <Route path="/course/:slug/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/course/:slug/quiz" element={<QuizPage />} />
            <Route path="/course/:slug/quiz/results/:attemptId" element={<QuizResults />} />
            <Route path="/course/:slug/certificate" element={<CertificatePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  )
}

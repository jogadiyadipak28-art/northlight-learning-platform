import { Link } from 'react-router-dom'
import { CourseCarousel } from '../components/CourseCarousel'
import { TestimonialsSection } from '../components/TestimonialsSection'
import { SplineScene } from '../components/SplineScene'
import { courses } from '../data/courses'

export function HomePage() {
  return (
    <main className="page home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Northlight Atelier · Learn by looking</p>
          <h1>Make work that makes people look twice.</h1>
          <p className="lede">
            Practical courses in photography, film, sound, and storytelling. Learn a craft, try it in your work,
            and return whenever you’re ready.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/catalog">Browse all courses</Link>
            <Link className="btn ghost" to="/dashboard">View your progress</Link>
          </div>
        </div>
        <section className="hero-feature hero-feature-spline" aria-label="Featured interactive course scene">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="hero-spline-viewer"
          />
          <span className="spline-credit">
            <a href="https://app.spline.design" target="_blank" rel="noreferrer">Open in Spline</a>
            <span aria-hidden="true"> · </span>
            <a href="https://spline.design" target="_blank" rel="noreferrer">Made with Spline</a>
          </span>
        </section>
      </section>

      <CourseCarousel courses={courses} />
      <TestimonialsSection />
    </main>
  )
}

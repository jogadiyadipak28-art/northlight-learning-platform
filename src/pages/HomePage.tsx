import { Link } from 'react-router-dom'
import { CourseCarousel } from '../components/CourseCarousel'
import { TestimonialsSection } from '../components/TestimonialsSection'
import { ParticleEffectHero } from '../components/ParticleEffectHero'
import { courses } from '../data/courses'

export function HomePage() {
  return (
    <main className="page home-page">
      <section className="home-hero">
        <ParticleEffectHero />
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
        <span className="particle-hero-hint" aria-hidden="true">Move your cursor to stir the particles</span>
      </section>

      <CourseCarousel courses={courses} />
      <TestimonialsSection />
    </main>
  )
}

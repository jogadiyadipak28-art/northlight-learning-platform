import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Course } from '../types'
import { formatHours } from '../lib/format'

export function CourseCarousel({ courses }: { courses: Course[] }) {
  const track = useRef<HTMLDivElement>(null)

  const move = (direction: -1 | 1) => {
    track.current?.scrollBy({ left: direction * 340, behavior: 'smooth' })
  }

  return (
    <section className="featured-section" aria-labelledby="featured-title">
      <div className="section-heading featured-heading">
        <div>
          <p className="eyebrow">Choose your next study</p>
          <h2 id="featured-title">Courses for a sharper eye</h2>
          <p className="muted">Browse practical lessons in image making, sound, writing, and editing.</p>
        </div>
        <div className="carousel-controls" aria-label="Course carousel controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous courses">←</button>
          <button type="button" onClick={() => move(1)} aria-label="More courses">→</button>
        </div>
      </div>
      <div className="course-carousel" ref={track}>
        {courses.map((course) => (
          <Link className="carousel-card" to={`/course/${course.slug}`} key={course.id}>
            <div className="carousel-cover">
              <img src={course.cover} alt="" loading="lazy" />
              <span className="chip">{course.category}</span>
            </div>
            <div className="carousel-card-body">
              <p className="muted">{course.level} · {formatHours(course.hours)}</p>
              <h3>{course.title}</h3>
              <p>{course.subtitle}</p>
              <span className="carousel-link">Explore course <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

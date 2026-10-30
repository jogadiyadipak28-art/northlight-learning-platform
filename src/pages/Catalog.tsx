import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, courses, levels } from '../data/courses'
import type { Category, Level } from '../types'
import { EmptyState, SkeletonGrid } from '../components/Skeleton'
import { formatHours } from '../lib/format'
import { courseProgressOf, overallPercent } from '../lib/progress'
import { useProgress } from '../context/ProgressContext'

const PAGE = 6
type SortKey = 'popular' | 'newest' | 'hours' | 'rating'

export function Catalog() {
  const { state } = useProgress()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [level, setLevel] = useState<Level | 'All'>('All')
  const [sort, setSort] = useState<SortKey>('popular')
  const [visible, setVisible] = useState(PAGE)
  const [loading, setLoading] = useState(true)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = courses.filter((course) => {
      const hay = `${course.title} ${course.subtitle} ${course.instructor.name} ${course.category}`.toLowerCase()
      const matchQ = !q || hay.includes(q)
      const matchC = category === 'All' || course.category === category
      const matchL = level === 'All' || course.level === level
      return matchQ && matchC && matchL
    })
    list = [...list].sort((a, b) => {
      if (sort === 'popular') return b.students - a.students
      if (sort === 'newest') return b.updatedAt.localeCompare(a.updatedAt)
      if (sort === 'hours') return a.hours - b.hours
      return b.rating - a.rating
    })
    return list
  }, [query, category, level, sort])

  useEffect(() => {
    setVisible(PAGE)
  }, [query, category, level, sort])

  useEffect(() => {
    const node = sentinel.current
    if (!node) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisible((n) => n + PAGE)
    })
    io.observe(node)
    return () => io.disconnect()
  }, [filtered.length, loading])

  const shown = filtered.slice(0, visible)

  return (
    <main className="page catalog-page">
      <section className="course-catalog" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <p className="eyebrow">The course library</p>
          <h2 id="catalog-title">Find the skill you want to build.</h2>
        </div>
      <div className="filters">
        <label className="search">
          <span className="sr-only">Search courses</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, instructor, craft…"
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as Category | 'All')}>
            <option>All</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Level
          <select value={level} onChange={(event) => setLevel(event.target.value as Level | 'All')}>
            <option>All</option>
            {levels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="popular">Most studied</option>
            <option value="newest">Recently updated</option>
            <option value="rating">Highest rated</option>
            <option value="hours">Shortest</option>
          </select>
        </label>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing in that corner" body="Clear a filter or try a shorter search." />
      ) : (
        <>
          <p className="count">{filtered.length} courses</p>
          <div className="course-grid">
            {shown.map((course) => {
              const progress = overallPercent(course, courseProgressOf(state, course.id))
              return (
                <Link key={course.id} to={`/course/${course.slug}`} className="course-card">
                  <div className="cover">
                    <img src={course.cover} alt="" loading="lazy" />
                    <span className="chip">{course.category}</span>
                  </div>
                  <div className="card-body">
                    <p className="muted">
                      {course.level} · {formatHours(course.hours)} · {course.rating.toFixed(1)}
                    </p>
                    <h2>{course.title}</h2>
                    <p>{course.subtitle}</p>
                    {progress > 0 ? (
                      <div className="mini-bar">
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
          {shown.length < filtered.length ? <div ref={sentinel} className="sentinel" /> : null}
        </>
      )}
      </section>
    </main>
  )
}

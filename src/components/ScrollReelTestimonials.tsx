import * as React from 'react'

export interface ScrollReelTestimonial {
  quote: string
  author: string
  role?: string
  image: string
  alt?: string
}

interface ScrollReelTestimonialsProps {
  testimonials: ScrollReelTestimonial[]
  charStaggerMs?: number
  className?: string
}

const CELL = 112
const GAP = 8
const STEP = 3 * (CELL + GAP)
const EXIT_MS = 240
const SLIDE_MS = 800
const EASE_IN_OUT = 'cubic-bezier(0.65,0,0.35,1)'

function classes(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ')
}

function PlaceholderCell() {
  return <div aria-hidden="true" className="reel-cell" style={{ width: CELL, height: CELL }} />
}

function FeaturedPortrait({ image, alt }: { image: string; alt?: string }) {
  return (
    <div className="reel-featured" style={{ width: CELL, height: CELL }}>
      <img src={image} alt={alt ?? ''} loading="lazy" />
      <span className="reel-photo-saturation" aria-hidden="true" />
      <span className="reel-photo-sheen" aria-hidden="true" />
    </div>
  )
}

function AnimatedWords({ text, startIndex, staggerMs }: { text: string; startIndex: number; staggerMs: number }) {
  let characterIndex = startIndex
  const words = text.split(' ')
  return (
    <>
      {words.map((word, wordIndex) => {
        const chars = Array.from(word).map((character, index) => {
          const delay = characterIndex * staggerMs
          characterIndex += 1
          return <span className="scroll-reel-char" key={index} style={{ animationDelay: `${delay}ms` }}>{character}</span>
        })
        if (wordIndex < words.length - 1) characterIndex += 1
        return <React.Fragment key={`${word}-${wordIndex}`}><span className="reel-word">{chars}</span>{wordIndex < words.length - 1 ? ' ' : null}</React.Fragment>
      })}
    </>
  )
}

export function ScrollReelTestimonials({ testimonials, charStaggerMs = 6, className }: ScrollReelTestimonialsProps) {
  const count = testimonials.length
  const [index, setIndex] = React.useState(0)
  const [displayIndex, setDisplayIndex] = React.useState(0)
  const [exiting, setExiting] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const animating = React.useRef(false)
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)))
    return () => {
      cancelAnimationFrame(frame)
      timeouts.current.forEach(clearTimeout)
    }
  }, [])

  const paginate = React.useCallback((direction: 1 | -1) => {
    if (animating.current) return
    const next = index + direction
    if (next < 0 || next >= count) return
    animating.current = true
    setIndex(next)
    setExiting(true)
    timeouts.current.push(setTimeout(() => {
      setDisplayIndex(next)
      setExiting(false)
    }, EXIT_MS))
    timeouts.current.push(setTimeout(() => {
      animating.current = false
    }, SLIDE_MS))
  }, [index, count])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      paginate(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      paginate(-1)
    }
  }

  const middleItems = React.useMemo(() => {
    const items: Array<{ type: 'cell' } | { type: 'featured'; index: number }> = []
    for (let item = 0; item < 3; item += 1) items.push({ type: 'cell' })
    testimonials.forEach((_, item) => {
      items.push({ type: 'featured', index: item })
      if (item < count - 1) items.push({ type: 'cell' }, { type: 'cell' })
    })
    for (let item = 0; item < 3; item += 1) items.push({ type: 'cell' })
    return items
  }, [testimonials, count])

  if (count === 0) return null
  const current = testimonials[Math.min(displayIndex, count - 1)]
  const middleY = (((count - 1) / 2) - index) * STEP
  const sideY = -middleY
  const columnStyle = (y: number): React.CSSProperties => ({
    transform: `translateY(${y}px)`,
    transition: mounted ? `transform ${SLIDE_MS}ms ${EASE_IN_OUT}` : 'none',
  })
  const sideCellCount = 4 + 2 * count

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Learner testimonials"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={classes('scroll-reel-testimonials', className)}
    >
      <div aria-hidden="true" className="scroll-reel-visual">
        <div className="scroll-reel-columns">
          <div className="scroll-reel-column" style={columnStyle(sideY)}>
            {Array.from({ length: sideCellCount }, (_, item) => <PlaceholderCell key={item} />)}
          </div>
          <div className="scroll-reel-column" style={columnStyle(middleY)}>
            {middleItems.map((item, key) => item.type === 'featured'
              ? <FeaturedPortrait key={key} image={testimonials[item.index].image} alt={testimonials[item.index].alt} />
              : <PlaceholderCell key={key} />)}
          </div>
          <div className="scroll-reel-column" style={columnStyle(sideY)}>
            {Array.from({ length: sideCellCount }, (_, item) => <PlaceholderCell key={item} />)}
          </div>
        </div>
      </div>

      <div className="scroll-reel-content">
        <div className="scroll-reel-copy">
          <svg className="scroll-reel-quote-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.58 17.32C3.55 16.23 3 15 3 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18zm10 0C13.55 16.23 13 15 13 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18z" />
          </svg>
          <div className="scroll-reel-text-stage" aria-live="polite">
            <div className="scroll-reel-size-copy" aria-hidden="true">
              <p className="scroll-reel-quote">{current.quote}</p>
              <p className="scroll-reel-author">{current.author}</p>
              {current.role ? <p className="scroll-reel-role">{current.role}</p> : null}
            </div>
            <div key={displayIndex} className={classes('scroll-reel-text', exiting && 'scroll-reel-exit')}>
              <p className="scroll-reel-quote"><AnimatedWords text={current.quote} startIndex={0} staggerMs={charStaggerMs} /></p>
              <p className="scroll-reel-author"><AnimatedWords text={current.author} startIndex={current.quote.length + 6} staggerMs={charStaggerMs} /></p>
              {current.role ? <p className="scroll-reel-role">{current.role}</p> : null}
            </div>
          </div>
        </div>

        <div className="scroll-reel-controls">
          <button type="button" onClick={() => paginate(-1)} disabled={index === 0} aria-label="Previous testimonial">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.5 2.5 3.5 6l4 3.5" /></svg>
          </button>
          <button type="button" onClick={() => paginate(1)} disabled={index === count - 1} aria-label="Next testimonial">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4.5 2.5 4 3.5-4 3.5" /></svg>
          </button>
          <span className="scroll-reel-count">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}

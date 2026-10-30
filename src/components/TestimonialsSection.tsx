import { ScrollReelTestimonials, type ScrollReelTestimonial } from './ScrollReelTestimonials'

const testimonials: ScrollReelTestimonial[] = [
  {
    quote: 'The framing lessons gave me a simple way to decide what belongs in the shot.',
    author: 'Amina R.',
    role: 'Photography learner',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    alt: 'Portrait of Amina, a photography learner',
  },
  {
    quote: 'I used to reach for another light. Now I start by turning the subject toward the window.',
    author: 'Jonah M.',
    role: 'Independent filmmaker',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    alt: 'Portrait of Jonah, an independent filmmaker',
  },
  {
    quote: 'Short lessons, clear ideas, and I can pick up right where I stopped.',
    author: 'Priya S.',
    role: 'Design student',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80',
    alt: 'Portrait of Priya, a design student',
  },
]

export function TestimonialsSection() {
  return (
    <section className="testimonials-section" aria-labelledby="testimonials-title">
      <div className="testimonials-intro">
        <p className="eyebrow">Notes from the studio</p>
        <h2 id="testimonials-title">Good work starts with looking closer.</h2>
        <p>Small, focused lessons make room for practice in the middle of real work.</p>
      </div>
      <ScrollReelTestimonials testimonials={testimonials} />
    </section>
  )
}

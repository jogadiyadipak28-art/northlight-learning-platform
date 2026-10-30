import { useEffect } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, type SpringOptions } from 'motion/react'

type BubbleColors = {
  first: string
  second: string
  third: string
  fourth: string
  fifth: string
  sixth: string
}

interface BubbleBackgroundProps {
  interactive?: boolean
  transition?: SpringOptions
  colors?: Partial<BubbleColors>
}

const defaultColors: BubbleColors = {
  first: '76, 92, 255',
  second: '183, 76, 255',
  third: '37, 198, 232',
  fourth: '35, 128, 171',
  fifth: '70, 85, 196',
  sixth: '127, 94, 255',
}

export function BubbleBackground({
  interactive = true,
  transition = { stiffness: 100, damping: 20 },
  colors: colorOverrides,
}: BubbleBackgroundProps) {
  const colors = { ...defaultColors, ...colorOverrides }
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, transition)
  const springY = useSpring(pointerY, transition)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!interactive) return

    const handlePointerMove = (event: MouseEvent) => {
      pointerX.set(event.clientX - window.innerWidth / 2)
      pointerY.set(event.clientY - window.innerHeight / 2)
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('mousemove', handlePointerMove)
  }, [interactive, pointerX, pointerY])

  const drift = reducedMotion ? 0 : 50
  const rotate = reducedMotion ? { duration: 0 } : { duration: 30, ease: 'easeInOut' as const, repeat: Infinity, repeatType: 'loop' as const }

  return (
    <div className="bubble-background" aria-hidden="true">
      <svg className="bubble-filter-defs" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="northlight-bubble-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className="bubble-field">
        <motion.div
          className="bubble-orb bubble-orb-one"
          style={{ background: `radial-gradient(circle, rgba(${colors.first},.78) 0%, rgba(${colors.first},0) 54%)` }}
          animate={reducedMotion ? { y: 0 } : { y: [-drift, drift, -drift] }}
          transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div className="bubble-spin bubble-spin-one" animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }} transition={reducedMotion ? rotate : { duration: 42, ease: 'linear', repeat: Infinity }}>
          <div className="bubble-orb bubble-orb-two" style={{ background: `radial-gradient(circle, rgba(${colors.second},.72) 0%, rgba(${colors.second},0) 55%)` }} />
        </motion.div>
        <motion.div className="bubble-spin bubble-spin-two" animate={reducedMotion ? { rotate: 0 } : { rotate: -360 }} transition={reducedMotion ? rotate : { duration: 56, ease: 'linear', repeat: Infinity }}>
          <div className="bubble-orb bubble-orb-three" style={{ background: `radial-gradient(circle, rgba(${colors.third},.7) 0%, rgba(${colors.third},0) 55%)` }} />
        </motion.div>
        <motion.div
          className="bubble-orb bubble-orb-four"
          style={{ background: `radial-gradient(circle, rgba(${colors.fourth},.68) 0%, rgba(${colors.fourth},0) 56%)` }}
          animate={reducedMotion ? { x: 0 } : { x: [-drift, drift, -drift] }}
          transition={{ duration: 48, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div className="bubble-spin bubble-spin-three" animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }} transition={reducedMotion ? rotate : { duration: 62, ease: 'linear', repeat: Infinity }}>
          <div className="bubble-orb bubble-orb-five" style={{ background: `radial-gradient(circle, rgba(${colors.fifth},.7) 0%, rgba(${colors.fifth},0) 56%)` }} />
        </motion.div>
        {interactive && !reducedMotion && (
          <motion.div
            className="bubble-orb bubble-orb-six"
            style={{
              x: springX,
              y: springY,
              background: `radial-gradient(circle, rgba(${colors.sixth},.65) 0%, rgba(${colors.sixth},0) 55%)`,
            }}
          />
        )}
      </div>
    </div>
  )
}

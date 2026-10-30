import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  anchorX: number
  anchorY: number
  phase: number
  radius: number
  speed: number
  color: string
}

const COLORS = ['#ffb36e', '#72d8cb', '#c7b9ff']

export function ParticleEffectHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !host || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: -1000, y: -1000, active: false }
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let frame = 0
    let time = 0

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const amount = Math.min(185, Math.max(72, Math.round((width * height) / 5700)))
      particles = Array.from({ length: amount }, (_, index) => {
        const x = Math.random() * width
        const y = Math.random() * height
        return {
          x,
          y,
          anchorX: x,
          anchorY: y,
          phase: Math.random() * Math.PI * 2,
          radius: 0.8 + Math.random() * 1.8,
          speed: 0.15 + Math.random() * 0.34,
          color: COLORS[index % COLORS.length],
        }
      })
      render(time)
    }

    const render = (now: number) => {
      time = now
      context.clearRect(0, 0, width, height)
      const positions = particles.map((particle) => {
        const sway = Math.sin(now * 0.00035 + particle.phase) * 9
        const driftX = particle.anchorX + sway
        const driftY = particle.anchorY + Math.cos(now * 0.0003 + particle.phase) * 8
        let x = particle.x + (driftX - particle.x) * 0.018
        let y = particle.y + (driftY - particle.y) * 0.018

        if (pointer.active) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distance = Math.hypot(dx, dy)
          const radius = 142
          if (distance < radius && distance > 0.1) {
            const push = (1 - distance / radius) * 3.2
            x += (dx / distance) * push
            y += (dy / distance) * push
          }
        }

        x += Math.sin(now * 0.0005 + particle.phase) * particle.speed * 0.12
        y += Math.cos(now * 0.00045 + particle.phase) * particle.speed * 0.12
        particle.x = x
        particle.y = y
        return { x, y, particle }
      })

      if (pointer.active) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 178)
        glow.addColorStop(0, 'rgba(114, 216, 203, 0.11)')
        glow.addColorStop(0.55, 'rgba(199, 185, 255, 0.055)')
        glow.addColorStop(1, 'rgba(199, 185, 255, 0)')
        context.fillStyle = glow
        context.fillRect(pointer.x - 178, pointer.y - 178, 356, 356)
      }

      for (let first = 0; first < positions.length; first += 1) {
        const a = positions[first]
        for (let second = first + 1; second < positions.length; second += 1) {
          const b = positions[second]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance < 84) {
            const nearPointer = pointer.active && Math.hypot((a.x + b.x) / 2 - pointer.x, (a.y + b.y) / 2 - pointer.y) < 180
            context.beginPath()
            context.moveTo(a.x, a.y)
            context.lineTo(b.x, b.y)
            context.strokeStyle = `${a.particle.color}${Math.round((1 - distance / 84) * (nearPointer ? 42 : 16)).toString(16).padStart(2, '0')}`
            context.lineWidth = nearPointer ? 0.85 : 0.55
            context.stroke()
          }
        }
      }

      for (const { x, y, particle } of positions) {
        const distance = pointer.active ? Math.hypot(x - pointer.x, y - pointer.y) : 1000
        const glow = distance < 150 ? 0.35 + (1 - distance / 150) * 0.65 : 0.42
        context.beginPath()
        context.arc(x, y, particle.radius * (distance < 150 ? 1.25 : 1), 0, Math.PI * 2)
        context.fillStyle = `${particle.color}${Math.round(glow * 255).toString(16).padStart(2, '0')}`
        context.fill()
      }

      if (!reducedMotion) frame = window.requestAnimationFrame(render)
    }

    const onPointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
      if (reducedMotion && !frame) frame = window.requestAnimationFrame((now) => {
        frame = 0
        render(now)
      })
    }
    const onPointerLeave = () => {
      pointer.active = false
      if (reducedMotion && !frame) frame = window.requestAnimationFrame((now) => {
        frame = 0
        render(now)
      })
    }

    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerleave', onPointerLeave)
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    return () => {
      observer.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-hero-canvas" aria-hidden="true" />
}

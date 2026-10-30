import { lazy, Suspense } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense fallback={<div className={className} aria-label="Loading interactive 3D scene" />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}

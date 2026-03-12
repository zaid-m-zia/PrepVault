'use client'

import GradientMesh from './GradientMesh'
import ParticleNetwork from './ParticleNetwork'

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed top-0 left-0 h-full w-full -z-10 overflow-hidden" aria-hidden>
      <GradientMesh />
      <ParticleNetwork />
      <div className="absolute inset-0 bg-white/25 dark:bg-slate-950/35" />
    </div>
  )
}

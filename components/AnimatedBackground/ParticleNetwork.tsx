'use client'

import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useTheme } from 'next-themes'

export default function ParticleNetwork() {
  const [ready, setReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setIsMobile(mq.matches)
    sync()

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync)
      return () => mq.removeEventListener('change', sync)
    }

    mq.addListener(sync)
    return () => mq.removeListener(sync)
  }, [])

  const isDark = resolvedTheme !== 'light'

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: isMobile ? 30 : 60,
          density: { enable: true, width: 1200, height: 800 },
        },
        color: { value: isDark ? '#93c5fd' : '#64748b' },
        size: { value: { min: 1, max: 2.2 } },
        opacity: { value: 0.3 },
        links: {
          enable: true,
          distance: 150,
          opacity: 0.2,
          width: 1,
          color: isDark ? '#93c5fd' : '#94a3b8',
        },
        move: {
          enable: true,
          speed: 0.4,
          direction: 'none' as const,
          random: true,
          outModes: 'out' as const,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false, mode: 'repulse' as const },
          onClick: { enable: false, mode: 'push' as const },
          resize: { enable: true },
        },
      },
      background: { color: 'transparent' },
    }),
    [isDark, isMobile]
  )

  if (!ready) return null

  return <Particles id="pv-particle-network" options={options} className="absolute inset-0" />
}

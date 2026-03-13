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
          value: isDark ? (isMobile ? 40 : 80) : isMobile ? 40 : 60,
          density: { enable: true, width: 1200, height: 800 },
        },
        color: { value: isDark ? '#94a3b8' : '#64748b' },
        size: { value: isDark ? { min: 1, max: 2.2 } : 2.5 },
        opacity: { value: isDark ? 0.6 : 0.45 },
        links: {
          enable: true,
          distance: isDark ? 150 : 140,
          opacity: isDark ? 0.4 : 0.35,
          width: 1,
          color: isDark ? '#64748b' : '#94a3b8',
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: 'none' as const,
          random: true,
          outModes: 'out' as const,
        },
      },
      interactivity: {
        detectsOn: 'window' as const,
        events: {
          onHover: { enable: true, mode: isDark ? ['grab', 'repulse'] : 'grab' },
          onClick: { enable: false, mode: 'push' as const },
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 170,
            links: {
              opacity: isDark ? 0.55 : 0.18,
            },
          },
          repulse: {
            distance: 110,
            duration: 0.45,
            speed: 0.5,
          },
        },
      },
      background: { color: 'transparent' },
    }),
    [isDark, isMobile]
  )

  if (!ready) return null

  return <Particles id="pv-particle-network" options={options} className="pointer-events-none absolute inset-0 z-[-1]" />
}

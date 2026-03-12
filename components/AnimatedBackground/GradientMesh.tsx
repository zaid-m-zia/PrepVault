'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

type BlobConfig = {
  className: string
  lightColor: string
  darkColor: string
  duration: number
  x: number[]
  y: number[]
  scale: number[]
}

const blobs: BlobConfig[] = [
  {
    className: 'top-[-15%] left-[-10%] h-[26rem] w-[26rem]',
    lightColor: 'bg-cyan-300/35',
    darkColor: 'bg-blue-500/20',
    duration: 42,
    x: [0, 40, -30, 0],
    y: [0, 35, -20, 0],
    scale: [1, 1.08, 0.96, 1],
  },
  {
    className: 'top-[8%] right-[-12%] h-[22rem] w-[22rem]',
    lightColor: 'bg-violet-300/30',
    darkColor: 'bg-indigo-500/18',
    duration: 54,
    x: [0, -35, 25, 0],
    y: [0, -25, 20, 0],
    scale: [1, 0.94, 1.06, 1],
  },
  {
    className: 'bottom-[-18%] left-[22%] h-[30rem] w-[30rem]',
    lightColor: 'bg-slate-300/35',
    darkColor: 'bg-purple-500/16',
    duration: 60,
    x: [0, 20, -20, 0],
    y: [0, -30, 18, 0],
    scale: [1, 1.04, 0.97, 1],
  },
  {
    className: 'bottom-[-20%] right-[12%] h-[20rem] w-[20rem]',
    lightColor: 'bg-sky-200/30',
    darkColor: 'bg-blue-400/14',
    duration: 48,
    x: [0, -24, 16, 0],
    y: [0, 18, -14, 0],
    scale: [1, 0.98, 1.05, 1],
  },
]

export default function GradientMesh() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'

  return (
    <div className="absolute inset-0 overflow-hidden">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl ${blob.className} ${isDark ? blob.darkColor : blob.lightColor}`}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{
            x: blob.x,
            y: blob.y,
            scale: blob.scale,
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

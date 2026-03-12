'use client'

import { motion } from 'framer-motion'

type MessageBubbleProps = {
  message: {
    id: string
    sender_id: string
    content: string
    created_at: string
  }
  isCurrentUser: boolean
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const createdAt = new Date(message.created_at)
  const timeString = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          isCurrentUser
            ? 'border border-indigo-200 bg-indigo-50 shadow-sm dark:border-cyan-400/30 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-cyan-600/10 dark:shadow-none'
            : 'border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none'
        }`}
      >
        <p className="text-sm break-words text-slate-800 dark:text-slate-200">{message.content}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{timeString}</p>
      </div>
    </motion.div>
  )
}

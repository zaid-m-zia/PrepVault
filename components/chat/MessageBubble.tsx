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
            ? 'glass border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10'
            : 'glass border border-white/10 bg-white/5'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p className="text-xs text-secondary-text mt-1">{timeString}</p>
      </div>
    </motion.div>
  )
}

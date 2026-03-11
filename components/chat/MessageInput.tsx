'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { buttonClasses } from '../ui/Button'

type MessageInputProps = {
  onSendMessage: (content: string) => void
  disabled?: boolean
  disabledReason?: string
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  disabledReason,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!message.trim() || sending || disabled) return

    setSending(true)
    try {
      await onSendMessage(message.trim())
      setMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {disabled && disabledReason && (
        <div className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-400/20 rounded px-3 py-2">
          {disabledReason}
        </div>
      )}
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? 'Follow to continue messaging' : 'Type a message...'}
          disabled={disabled || sending}
          className="flex-1 glass rounded-lg px-4 py-3 border border-white/10 focus:border-cyan-400/50 focus:outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <motion.button
          type="submit"
          disabled={!message.trim() || sending || disabled}
          whileHover={!disabled && !sending ? { scale: 1.05 } : {}}
          whileTap={!disabled && !sending ? { scale: 0.95 } : {}}
          className={buttonClasses({ size: 'md', className: 'px-6 py-3 rounded-lg text-sm' })}
        >
          {sending ? 'Sending...' : 'Send'}
        </motion.button>
      </div>
    </form>
  )
}

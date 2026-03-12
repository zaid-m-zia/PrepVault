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
      <div className="flex gap-3 rounded-xl border border-gray-200 bg-gray-100 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? 'Follow to continue messaging' : 'Type a message...'}
          disabled={disabled || sending}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
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

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { Smile, X } from 'lucide-react'
import { buttonClasses } from '../ui/Button'

type MessageInputProps = {
  onSendMessage: (text: string, replyToId?: string | null) => Promise<void>
  onUpdateMessage: (messageId: string, text: string) => Promise<void>
  onTypingChange: (isTyping: boolean) => void
  editingMessage: { id: string; message: string } | null
  replyingTo: { id: string; message: string; sender_id: string } | null
  currentUserId: string
  onCancelEdit: () => void
  onCancelReply: () => void
  disabled?: boolean
  disabledReason?: string
}

export default function MessageInput({
  onSendMessage,
  onUpdateMessage,
  onTypingChange,
  editingMessage,
  replyingTo,
  currentUserId,
  onCancelEdit,
  onCancelReply,
  disabled = false,
  disabledReason,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.message)
    }
  }, [editingMessage])

  function handleEmojiClick(emojiData: EmojiClickData) {
    setMessage((prev) => `${prev}${emojiData.emoji}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!message.trim() || sending || disabled) return

    setSending(true)
    try {
      if (editingMessage) {
        await onUpdateMessage(editingMessage.id, message.trim())
        onCancelEdit()
      } else {
        await onSendMessage(message.trim(), replyingTo?.id || null)
        onCancelReply()
      }
      onTypingChange(false)
      setMessage('')
      setShowEmojiPicker(false)
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {replyingTo && !editingMessage && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-slate-200">
          <div className="min-w-0">
            <p className="font-semibold text-indigo-700 dark:text-indigo-300">
              Replying to {replyingTo.sender_id === currentUserId ? 'yourself' : 'message'}
            </p>
            <p className="line-clamp-1 text-slate-600 dark:text-slate-300">{replyingTo.message}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-slate-200">
          <div className="min-w-0">
            <p className="font-semibold text-purple-700 dark:text-purple-300">Editing message</p>
            <p className="line-clamp-1 text-slate-600 dark:text-slate-300">{editingMessage.message}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onCancelEdit()
              setMessage('')
            }}
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Cancel edit"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {disabled && disabledReason && (
        <div className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-400/20 rounded px-3 py-2">
          {disabledReason}
        </div>
      )}

      <div className="relative flex gap-3 rounded-xl border border-gray-200 bg-gray-100 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          disabled={disabled || sending}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          aria-label="Toggle emoji picker"
        >
          <Smile className="h-5 w-5" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => {
            const value = e.target.value
            setMessage(value)
            onTypingChange(value.trim().length > 0)
          }}
          onBlur={() => onTypingChange(false)}
          placeholder={
            disabled
              ? 'Follow to continue messaging'
              : editingMessage
                ? 'Edit your message...'
                : 'Type a message...'
          }
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
          {sending ? (editingMessage ? 'Saving...' : 'Sending...') : editingMessage ? 'Save' : 'Send'}
        </motion.button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-40 overflow-hidden rounded-xl border border-gray-200 shadow-lg dark:border-slate-700">
            <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis />
          </div>
        )}
      </div>
    </form>
  )
}

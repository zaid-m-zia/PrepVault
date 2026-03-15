'use client'

import { motion } from 'framer-motion'
import { CornerUpLeft, Pencil, Trash2 } from 'lucide-react'

type MessageBubbleProps = {
  message: {
    id: string
    sender_id: string
    message: string
    created_at: string
    edited?: boolean | null
    deleted?: boolean | null
    reply_to?: string | null
  }
  isCurrentUser: boolean
  replyPreview?: string | null
  onReply: (messageId: string) => void
  onEdit: (messageId: string) => void
  onDelete: (messageId: string) => void
}

export default function MessageBubble({
  message,
  isCurrentUser,
  replyPreview,
  onReply,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const createdAt = new Date(message.created_at)
  const timeString = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isDeleted = Boolean(message.deleted)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="relative max-w-xs lg:max-w-md">
        {!isDeleted && (
          <div className={`absolute -top-8 ${isCurrentUser ? 'right-0' : 'left-0'} opacity-0 transition-opacity group-hover:opacity-100`}>
            <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => onReply(message.id)}
                className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
                aria-label="Reply to message"
              >
                <CornerUpLeft className="h-3.5 w-3.5" />
              </button>
              {isCurrentUser && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(message.id)}
                    className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
                    aria-label="Edit message"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(message.id)}
                    className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                    aria-label="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 ${
            isCurrentUser
              ? 'border border-indigo-200 bg-indigo-50 shadow-sm dark:border-indigo-400/40 dark:bg-gradient-to-br dark:from-indigo-600 dark:to-purple-600 dark:text-white dark:shadow-none'
              : 'border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none'
          }`}
        >
          {!isDeleted && replyPreview && (
            <div className="mb-2 rounded-lg border-l-2 border-indigo-400 bg-indigo-50/70 px-3 py-2 text-xs text-slate-600 dark:border-indigo-300/70 dark:bg-black/20 dark:text-slate-200">
              {replyPreview}
            </div>
          )}

          <p className={`text-sm break-words ${isCurrentUser ? 'text-slate-800 dark:text-white' : 'text-slate-800 dark:text-slate-300'}`}>
            {isDeleted ? 'message deleted' : message.message}
          </p>
          <p className={`mt-1 text-xs ${isCurrentUser ? 'text-slate-500 dark:text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {timeString}
            {message.edited && !isDeleted ? ' · edited' : ''}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

type Conversation = {
  userId: string
  username: string
  full_name?: string
  lastMessage?: string
  lastMessageTime?: string
}

type ConversationListProps = {
  conversations: Conversation[]
  selectedUserId: string | null
  onSelectConversation: (userId: string) => void
}

export default function ConversationList({
  conversations,
  selectedUserId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="flex w-80 flex-col border-r border-gray-200 bg-gray-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">Messages</h2>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {conversations.map((conv, idx) => (
              <motion.div
                key={conv.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectConversation(conv.userId)}
                className={`cursor-pointer p-4 transition-all hover:bg-white hover:shadow-sm dark:hover:bg-white/5 dark:hover:shadow-none ${
                  selectedUserId === conv.userId
                    ? 'border-l-2 border-indigo-500 bg-white shadow-sm dark:border-cyan-400 dark:bg-white/10 dark:shadow-none'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:shadow-none">
                    {(conv.full_name || conv.username)
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${conv.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="line-clamp-1 font-semibold text-slate-800 transition-colors hover:text-indigo-500 dark:text-slate-200 dark:hover:text-cyan-400"
                    >
                      {conv.full_name || conv.username}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">@{conv.username}</p>
                  </div>
                </div>
                {conv.lastMessage && (
                  <div className="ml-13">
                    <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{conv.lastMessage}</p>
                    {conv.lastMessageTime && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">{conv.lastMessageTime}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

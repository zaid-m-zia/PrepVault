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
    <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-display font-semibold">Messages</h2>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-secondary-text">
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {conversations.map((conv, idx) => (
              <motion.div
                key={conv.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectConversation(conv.userId)}
                className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                  selectedUserId === conv.userId ? 'bg-white/10 border-l-2 border-cyan-400' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg glass border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
                      className="font-semibold hover:text-cyan-400 transition-colors line-clamp-1"
                    >
                      {conv.full_name || conv.username}
                    </Link>
                    <p className="text-xs text-secondary-text">@{conv.username}</p>
                  </div>
                </div>
                {conv.lastMessage && (
                  <div className="ml-13">
                    <p className="text-xs text-secondary-text line-clamp-1">{conv.lastMessage}</p>
                    {conv.lastMessageTime && (
                      <p className="text-xs text-secondary-text/50">{conv.lastMessageTime}</p>
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

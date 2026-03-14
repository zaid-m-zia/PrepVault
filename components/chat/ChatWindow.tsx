'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { createNotification } from '../../lib/notifications'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import MessageLimitPopup from './MessageLimitPopup'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  is_read: boolean
}

type ChatUser = {
  id: string
  username: string
  full_name?: string
  bio?: string
}

type ChatWindowProps = {
  currentUserId: string
  selectedUserId: string
  onConversationUpdated: () => void
}

export default function ChatWindow({
  currentUserId,
  selectedUserId,
  onConversationUpdated,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLimitPopup, setShowLimitPopup] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    async function initialize() {
      setLoading(true)
      try {
        // Fetch selected user profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, username, full_name, bio')
          .eq('id', selectedUserId)
          .single()

        if (userProfile) {
          setSelectedUser(userProfile)
        }

        // Check follow status
        const { data: followData } = await supabase
          .from('follows')
          .select('status')
          .eq('follower_id', currentUserId)
          .eq('following_id', selectedUserId)
          .single()

        setIsFollowing(followData?.status === 'accepted')

        // Fetch messages
        await fetchMessages()

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('recipient_id', currentUserId)
          .eq('sender_id', selectedUserId)
      } catch (err) {
        console.error('Error initializing chat window:', err)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [selectedUserId, currentUserId])

  async function fetchMessages() {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},recipient_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true })

      setMessages(data || [])

      // Count messages sent by current user to selected user
      const sentCount = (data || []).filter(
        (m: any) => m.sender_id === currentUserId && m.recipient_id === selectedUserId
      ).length

      setMessageCount(sentCount)
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  async function handleSendMessage(content: string) {
    try {
      // Check if user has reached 2-message limit (only if not following)
      if (!isFollowing && messageCount >= 2) {
        setShowLimitPopup(true)
        return
      }

      // Send message
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        recipient_id: selectedUserId,
        content,
        is_read: false,
      })

      if (error) throw error

      const { error: notificationError } = await createNotification({
        user_id: selectedUserId,
        type: 'message',
        content: `NEW_DM:${currentUserId}:${content.slice(0, 120)}`,
      })

      if (notificationError) {
        console.error('Error creating DM notification:', notificationError)
      }

      // Update local state
      setMessageCount((prev) => prev + 1)

      // Refresh messages and conversation list
      await fetchMessages()
      onConversationUpdated()

      // Check if limit reached after sending
      if (!isFollowing && messageCount + 1 >= 2) {
        setShowLimitPopup(true)
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-white shadow-sm dark:bg-slate-900 dark:shadow-none">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-lg font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:shadow-none">
              {(selectedUser?.full_name || selectedUser?.username)
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <Link
                href={`/profile/${selectedUser?.username}`}
                className="font-semibold text-slate-800 transition-colors hover:text-indigo-500 dark:text-slate-200 dark:hover:text-cyan-400"
              >
                {selectedUser?.full_name || selectedUser?.username}
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">@{selectedUser?.username}</p>
            </div>
          </div>
          {!isFollowing && (
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:border-yellow-400/30 dark:bg-transparent dark:text-yellow-300">
              Not following
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-white p-6 dark:bg-slate-900">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.sender_id === currentUserId}
            />
          ))
        )}
      </div>

      {/* Message Limit Warning */}
      {showLimitPopup && (
        <MessageLimitPopup
          recipientUsername={selectedUser?.username || 'User'}
          onClose={() => setShowLimitPopup(false)}
        />
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isFollowing && messageCount >= 2}
          disabledReason={!isFollowing && messageCount >= 2 ? 'Message limit reached' : undefined}
        />
      </div>
    </div>
  )
}

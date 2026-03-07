'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
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
  read: boolean
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

        // Check if following
        const { data: followData } = await supabase
          .from('follows')
          .select('status')
          .eq('follower_id', currentUserId)
          .eq('following_id', selectedUserId)
          .single()

        setIsFollowing(!!followData)

        // Fetch messages
        await fetchMessages()

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read: true })
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
      // Check if user has reached 2-message limit
      if (!isFollowing && messageCount >= 2) {
        setShowLimitPopup(true)
        return
      }

      // Send message
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        recipient_id: selectedUserId,
        content,
        read: false,
      })

      if (error) throw error

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
        <div className="text-secondary-text">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-6 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg glass border border-white/10 flex items-center justify-center text-lg font-bold">
              {(selectedUser?.full_name || selectedUser?.username)
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <Link
                href={`/profile/${selectedUser?.username}`}
                className="font-semibold hover:text-cyan-400 transition-colors"
              >
                {selectedUser?.full_name || selectedUser?.username}
              </Link>
              <p className="text-sm text-secondary-text">@{selectedUser?.username}</p>
            </div>
          </div>
          {!isFollowing && (
            <div className="text-xs glass px-3 py-1 rounded border border-yellow-400/30 text-yellow-300">
              Not following
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-purple-500/5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-secondary-text">
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
      <div className="border-t border-white/10 p-6 bg-black/20">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isFollowing && messageCount >= 2}
          disabledReason={!isFollowing && messageCount >= 2 ? 'Message limit reached' : undefined}
        />
      </div>
    </div>
  )
}

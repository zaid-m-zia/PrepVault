'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import supabase from '../../lib/supabaseClient'
import { createNotification } from '../../lib/notifications'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import MessageLimitPopup from './MessageLimitPopup'
import { ChevronDown } from 'lucide-react'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
  edited?: boolean | null
  deleted?: boolean | null
  reply_to?: string | null
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

function isNearBottom(container: HTMLDivElement) {
  return container.scrollHeight - container.scrollTop - container.clientHeight < 100
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)

  const messageById = useMemo(() => {
    return new Map(messages.map((msg) => [msg.id, msg]))
  }, [messages])

  const editingMessage = useMemo(() => {
    if (!editingMessageId) return null
    const message = messageById.get(editingMessageId)
    if (!message || message.sender_id !== currentUserId || message.deleted) return null
    return { id: message.id, message: message.message }
  }, [editingMessageId, messageById, currentUserId])

  const replyingTo = useMemo(() => {
    if (!replyToMessageId) return null
    const message = messageById.get(replyToMessageId)
    if (!message || message.deleted) return null
    return { id: message.id, message: message.message, sender_id: message.sender_id }
  }, [replyToMessageId, messageById])

  function scrollToBottom(force = false) {
    const container = messagesContainerRef.current
    if (!container) return

    if (force || shouldAutoScrollRef.current || isNearBottom(container)) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      shouldAutoScrollRef.current = true
      setShowJumpToLatest(false)
    }
  }

  useEffect(() => {
    async function initialize() {
      setLoading(true)
      setEditingMessageId(null)
      setReplyToMessageId(null)

      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, username, full_name, bio')
          .eq('id', selectedUserId)
          .single()

        if (userProfile) {
          setSelectedUser(userProfile)
        }

        const { data: followData } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', selectedUserId)
          .maybeSingle()

        setIsFollowing(Boolean(followData?.id))

        await fetchMessages(true)
      } catch (err) {
        console.error('Error initializing chat window:', err)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [selectedUserId, currentUserId])

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${currentUserId}-${selectedUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload: { eventType: string; new: Message }) => {
          const incomingMessage = payload.new as Message
          const isCurrentChatMessage =
            (incomingMessage.sender_id === currentUserId && incomingMessage.receiver_id === selectedUserId) ||
            (incomingMessage.sender_id === selectedUserId && incomingMessage.receiver_id === currentUserId)

          if (!isCurrentChatMessage) return

          if (payload.eventType === 'INSERT') {
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === incomingMessage.id)) return prev
              return [...prev, incomingMessage]
            })

            if (incomingMessage.sender_id === currentUserId) {
              setMessageCount((prev) => prev + 1)
            }
          }

          if (payload.eventType === 'UPDATE') {
            setMessages((prev) => prev.map((msg) => (msg.id === incomingMessage.id ? { ...msg, ...incomingMessage } : msg)))
          }

          onConversationUpdated()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, selectedUserId, onConversationUpdated])

  useEffect(() => {
    scrollToBottom(false)
  }, [messages])

  async function fetchMessages(forceScroll = false) {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true })

      const resolvedMessages = (data || []) as Message[]
      setMessages(resolvedMessages)

      const sentCount = resolvedMessages.filter(
        (message) => message.sender_id === currentUserId && message.receiver_id === selectedUserId
      ).length

      setMessageCount(sentCount)

      requestAnimationFrame(() => scrollToBottom(forceScroll))
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  async function handleSendMessage(text: string, replyToId?: string | null) {
    try {
      if (!isFollowing && messageCount >= 2) {
        setShowLimitPopup(true)
        return
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedUserId,
          message: text,
          reply_to: replyToId || null,
        })

      if (error) throw error

      const { error: notificationError } = await createNotification({
        user_id: selectedUserId,
        type: 'message',
        content: `NEW_DM:${currentUserId}:${text.slice(0, 120)}`,
      })

      if (notificationError) {
        console.error('Error creating DM notification:', notificationError)
      }

      if (!isFollowing && messageCount + 1 >= 2) {
        setShowLimitPopup(true)
      }
    } catch (err) {
      console.error('Error sending message:', err)
      throw err
    }
  }

  async function handleUpdateMessage(messageId: string, newText: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          message: newText,
          edited: true,
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId)

      if (error) throw error

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                message: newText,
                edited: true,
              }
            : message
        )
      )
    } catch (err) {
      console.error('Error updating message:', err)
      throw err
    }
  }

  async function handleDeleteMessage(messageId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted: true })
        .eq('id', messageId)
        .eq('sender_id', currentUserId)

      if (error) throw error

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                deleted: true,
              }
            : message
        )
      )

      if (editingMessageId === messageId) {
        setEditingMessageId(null)
      }

      if (replyToMessageId === messageId) {
        setReplyToMessageId(null)
      }
    } catch (err) {
      console.error('Error deleting message:', err)
    }
  }

  function handleMessagesScroll() {
    const container = messagesContainerRef.current
    if (!container) return
    const nearBottom = isNearBottom(container)
    shouldAutoScrollRef.current = nearBottom
    setShowJumpToLatest(!nearBottom)
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
                href={`/profile/${selectedUser?.id}`}
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

      <div className="relative flex-1">
        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="h-full space-y-4 overflow-y-auto bg-white p-6 dark:bg-slate-900"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const replyPreviewMessage = msg.reply_to ? messageById.get(msg.reply_to) : null
              const replyPreview = replyPreviewMessage
                ? replyPreviewMessage.deleted
                  ? 'message deleted'
                  : replyPreviewMessage.message
                : null

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.sender_id === currentUserId}
                  replyPreview={replyPreview}
                  onReply={(messageId) => {
                    setReplyToMessageId(messageId)
                    setEditingMessageId(null)
                  }}
                  onEdit={(messageId) => {
                    const targetMessage = messageById.get(messageId)
                    if (!targetMessage || targetMessage.sender_id !== currentUserId || targetMessage.deleted) return
                    setEditingMessageId(messageId)
                    setReplyToMessageId(null)
                  }}
                  onDelete={handleDeleteMessage}
                />
              )
            })
          )}
        </div>

        {showJumpToLatest && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-600 shadow-md transition-colors hover:bg-indigo-50 dark:border-indigo-400/40 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Latest
          </button>
        )}
      </div>

      {showLimitPopup && (
        <MessageLimitPopup
          recipientId={selectedUser?.id || ''}
          recipientUsername={selectedUser?.username || 'User'}
          onClose={() => setShowLimitPopup(false)}
        />
      )}

      <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
        <MessageInput
          onSendMessage={handleSendMessage}
          onUpdateMessage={handleUpdateMessage}
          editingMessage={editingMessage}
          replyingTo={replyingTo}
          currentUserId={currentUserId}
          onCancelEdit={() => setEditingMessageId(null)}
          onCancelReply={() => setReplyToMessageId(null)}
          disabled={!isFollowing && messageCount >= 2}
          disabledReason={!isFollowing && messageCount >= 2 ? 'Message limit reached' : undefined}
        />
      </div>
    </div>
  )
}

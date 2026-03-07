'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import ConversationList from '../../components/chat/ConversationList'
import ChatWindow from '../../components/chat/ChatWindow'

type Conversation = {
  userId: string
  username: string
  full_name?: string
  lastMessage?: string
  lastMessageTime?: string
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initialize() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          window.location.href = '/login'
          return
        }
        setCurrentUser(authData.user)
        await fetchConversations(authData.user.id)
      } catch (err) {
        console.error('Error initializing chat:', err)
        setError('Failed to load chat')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  async function fetchConversations(userId: string) {
    try {
      // Get all distinct users the current user has messaged with
      const { data: messages, error: err } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (err) throw err

      // Get unique conversation partners
      const conversationMap = new Map<string, Conversation>()

      for (const msg of messages || []) {
        const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            userId: partnerId,
            username: '',
            lastMessage: msg.content,
            lastMessageTime: new Date(msg.created_at).toLocaleString(),
          })
        }
      }

      // Fetch partner profiles
      const partnerIds = Array.from(conversationMap.keys())
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', partnerIds)

        profiles?.forEach((profile: any) => {
          const conv = conversationMap.get(profile.id)
          if (conv) {
            conv.username = profile.username
            conv.full_name = profile.full_name
          }
        })
      }

      setConversations(Array.from(conversationMap.values()))
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  if (loading) {
    return (
      <section className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-secondary-text">Loading chat...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </section>
    )
  }

  return (
    <section className="h-[calc(100vh-120px)] flex bg-gradient-to-br from-black/40 to-purple-900/10 border-t border-white/5">
      {/* Sidebar */}
      <ConversationList
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelectConversation={setSelectedUserId}
      />

      {/* Chat Area */}
      {selectedUserId && currentUser ? (
        <ChatWindow
          currentUserId={currentUser.id}
          selectedUserId={selectedUserId}
          onConversationUpdated={() => fetchConversations(currentUser.id)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-secondary-text">
          {conversations.length === 0 ? (
            <p>No conversations yet. Search for users to start messaging!</p>
          ) : (
            <p>Select a conversation to start chatting</p>
          )}
        </div>
      )}
    </section>
  )
}

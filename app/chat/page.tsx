'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import ConversationList from '../../components/chat/ConversationList'
import ChatWindow from '../../components/chat/ChatWindow'
import Button from '../../components/ui/Button'

type Conversation = {
  userId: string
  username: string
  full_name?: string
  lastMessage?: string
  lastMessageTime?: string
}

function ChatContent() {
  const searchParams = useSearchParams()
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initialize() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session

        if (!session) {
          setLoading(false)
          return
        }
        setCurrentUser(session.user)
        await fetchConversations(session.user.id)

        // Check for user query parameter
        const userParam = searchParams.get('user')
        if (userParam) {
          setSelectedUserId(userParam)
        }
      } catch (err) {
        console.error('Error initializing chat:', err)
        setError('Failed to load chat')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [searchParams])

  async function fetchConversations(userId: string) {
    try {
      // Get all distinct users the current user has messaged with
      const { data: messages, error: err } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, message, created_at, deleted')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (err) throw err

      // Get unique conversation partners
      const conversationMap = new Map<string, Conversation>()

      for (const msg of messages || []) {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            userId: partnerId,
            username: '',
            lastMessage: msg.deleted ? 'message deleted' : msg.message,
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
        <div className="text-slate-500 dark:text-slate-400">Loading chat...</div>
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

  if (!currentUser) {
    return (
      <section className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="glass rounded-xl p-8 border border-gray-200 dark:border-white/10 text-center max-w-md mx-4 shadow-sm dark:shadow-none">
          <h1 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-slate-100">Please Log In</h1>
          <p className="mb-6 text-slate-500 dark:text-slate-400">You need to be logged in to access chat.</p>
          <Button
            onClick={() => window.location.href = '/login'}
            size="sm"
            className="px-6 py-2 rounded-md"
          >
            Go to Login
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="h-[calc(100vh-120px)] flex overflow-hidden border-t border-gray-200 bg-white shadow-sm dark:border-white/5 dark:bg-slate-900/70 dark:shadow-none">
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
        <div className="flex-1 flex items-center justify-center bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
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

export default function ChatPage() {
  return (
    <Suspense fallback={
      <section className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chat...</div>
      </section>
    }>
      <ChatContent />
    </Suspense>
  )
}

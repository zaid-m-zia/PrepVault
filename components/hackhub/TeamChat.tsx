'use client'

import { useEffect, useMemo, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { createNotification } from '../../lib/notifications'
import Button from '../ui/Button'

type TeamMessage = {
  id: string
  team_id: string
  sender_id: string
  content: string
  created_at: string
}

type TeamChatProps = {
  teamId: string
}

export default function TeamChat({ teamId }: TeamChatProps) {
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [senderMap, setSenderMap] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)

  const canSend = useMemo(() => Boolean(currentUserId), [currentUserId])

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch team messages:', error)
      setMessages([])
      return
    }

    const teamMessages = (data ?? []) as TeamMessage[]
    setMessages(teamMessages)

    const senderIds = Array.from(new Set(teamMessages.map((message) => message.sender_id).filter(Boolean)))
    if (senderIds.length === 0) {
      setSenderMap({})
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', senderIds)

    if (profileError) {
      console.error('Failed to fetch sender profiles:', profileError)
      return
    }

    const map: Record<string, string> = {}
    ;(profileData ?? []).forEach((profile: any) => {
      map[profile.id] = profile.full_name || profile.username || 'Unknown'
    })

    setSenderMap(map)
  }

  useEffect(() => {
    let mounted = true

    async function initializeChat() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setCurrentUserId(data?.session?.user?.id ?? null)
        await fetchMessages()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeChat()

    const channel = supabase
      .channel(`team-messages-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `team_id=eq.${teamId}`,
        },
        async () => {
          await fetchMessages()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [teamId])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) return

    const content = newMessage.trim()
    if (!content) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          team_id: teamId,
          sender_id: currentUserId,
          content,
        })

      if (error) throw error

      const [{ data: teamData }, { data: memberData }] = await Promise.all([
        supabase.from('teams').select('created_by').eq('id', teamId).maybeSingle(),
        supabase.from('team_members').select('user_id').eq('team_id', teamId),
      ])

      const recipientIds = new Set<string>()
      if (teamData?.created_by) recipientIds.add(teamData.created_by)
      ;(memberData ?? []).forEach((member: any) => {
        if (member?.user_id) recipientIds.add(member.user_id)
      })
      recipientIds.delete(currentUserId)

      for (const recipientId of recipientIds) {
        const { error: notificationError } = await createNotification({
          user_id: recipientId,
          type: 'message',
          content: `TEAM_MESSAGE:${teamId}:${currentUserId}:${content.slice(0, 120)}`,
          related_id: teamId,
        })

        if (notificationError) {
          console.error('Failed to create team message notification:', notificationError)
        }
      }

      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteMessage(messageId: string) {
    if (!currentUserId) return
    setDeletingMessageId(messageId)
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to delete message:', error)
    } finally {
      setDeletingMessageId(null)
    }
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/10 mt-6">
      <h2 className="text-lg font-semibold">Team Chat</h2>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/3 p-4 max-h-[380px] overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-sm text-secondary-text">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-secondary-text">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId
            const senderName = senderMap[message.sender_id] || 'Unknown'
            const formattedTime = message.created_at ? new Date(message.created_at).toLocaleString() : ''

            return (
              <div key={message.id} className="rounded-md border border-white/10 bg-[#07102a] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{senderName}</p>
                    <p className="text-[11px] text-secondary-text mt-0.5">{formattedTime}</p>
                  </div>
                  {isOwnMessage && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteMessage(message.id)}
                      disabled={deletingMessageId === message.id}
                    >
                      {deletingMessageId === message.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-200" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  {message.content}
                </p>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-md bg-[#07102a] px-3 py-2 border border-white/10"
          placeholder={canSend ? 'Type your message...' : 'Log in to send messages'}
          disabled={!canSend || sending}
        />
        <Button type="submit" size="sm" disabled={!canSend || sending || !newMessage.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  )
}

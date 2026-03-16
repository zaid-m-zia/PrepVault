'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import supabase from '../../lib/supabaseClient'
import { createNotification } from '../../lib/notifications'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'

type Notification = {
  id: string
  user_id: string
  actor_id?: string | null
  type: 'message' | 'follow_request' | 'follow_accepted' | string
  entity_id?: string | null
  content: string
  read: boolean
  created_at: string
}

type ProfileLite = {
  id: string
  username: string
  full_name?: string | null
  avatar_url?: string | null
}

function parseMessagePreview(content: string) {
  // Backward compat: strip old NEW_DM:userId: prefix if present
  if (content.startsWith('NEW_DM:')) {
    const parts = content.split(':')
    return parts.slice(2).join(':').slice(0, 50)
  }
  return content
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profilesById, setProfilesById] = useState<Record<string, ProfileLite>>({})

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications])

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session

        if (!mounted) return
        if (!session) {
          setLoading(false)
          return
        }

        setUser(session.user)
        await fetchNotifications(session.user.id)
        void supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', session.user.id)
          .eq('read', false)
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      } catch (error) {
        console.error('Failed to initialize notifications page:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`notifications-insert-live-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Notification }) => {
          const incoming = payload.new

          setNotifications((prev) => {
            if (prev.some((notification) => notification.id === incoming.id)) return prev
            return [incoming, ...prev]
          })

          if (incoming.actor_id) {
            void fetchMissingProfiles([incoming.actor_id])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  async function fetchMissingProfiles(profileIds: string[]) {
    const uniqueIds = Array.from(new Set(profileIds.filter(Boolean))).filter((id) => !profilesById[id])
    if (uniqueIds.length === 0) return

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', uniqueIds)

    if (error) {
      console.error('Failed to fetch notification actor profiles:', error)
      return
    }

    const nextProfiles: Record<string, ProfileLite> = {}
    for (const profile of data || []) {
      nextProfiles[profile.id] = profile
    }

    setProfilesById((prev) => ({ ...prev, ...nextProfiles }))
  }

  async function fetchNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, actor_id, type, entity_id, content, read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch notifications:', error)
      return
    }

    const rows = (data || []) as Notification[]
    setNotifications(rows)
    await fetchMissingProfiles(rows.map((notification) => notification.actor_id || '').filter(Boolean))
  }

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Failed to mark notification as read:', error)
      return
    }

    setNotifications((prev) => prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)))
  }

  async function clearAllNotifications() {
    if (!user?.id) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Failed to clear notifications:', error)
      return
    }

    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  async function acceptFollowRequest(notification: Notification) {
    if (!user?.id || !notification.actor_id || !notification.entity_id) return

    const { error: updateRequestError } = await supabase
      .from('follow_requests')
      .update({ status: 'accepted' })
      .eq('id', notification.entity_id)
      .eq('receiver_id', user.id)

    if (updateRequestError) {
      console.error('Failed to accept follow request:', updateRequestError)
      return
    }

    const { data: existingFollower } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', notification.actor_id)
      .eq('following_id', user.id)
      .maybeSingle()

    if (!existingFollower) {
      const { error: followerError } = await supabase
        .from('followers')
        .insert({
          follower_id: notification.actor_id,
          following_id: user.id,
        })

      if (followerError) {
        console.error('Failed to create follower row:', followerError)
        return
      }
    }

    // Delete the notification and remove from local state
    await deleteNotification(notification.id)

    const actorProfile = profilesById[notification.actor_id]
    const actorName = actorProfile?.full_name || actorProfile?.username || 'Someone'

    await createNotification({
      user_id: notification.actor_id,
      actor_id: user.id,
      type: 'follow_accepted',
      entity_id: notification.entity_id,
      content: `${actorName} accepted your follow request.`,
      read: false,
      dedupe: true,
    })
  }

  async function deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Failed to delete notification:', error)
      return
    }

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  async function rejectFollowRequest(notification: Notification) {
    if (!user?.id || !notification.entity_id) return

    const { error } = await supabase
      .from('follow_requests')
      .update({ status: 'rejected' })
      .eq('id', notification.entity_id)
      .eq('receiver_id', user.id)

    if (error) {
      console.error('Failed to reject follow request:', error)
      return
    }

    await markAsRead(notification.id)
  }

  function renderNotificationText(notification: Notification) {
    const actor = notification.actor_id ? profilesById[notification.actor_id] : undefined
    const actorName = actor?.full_name || actor?.username || 'Someone'

    if (notification.type === 'message') {
      const preview = parseMessagePreview(notification.content)
      return `New direct message ${actorName}: ${preview}`
    }

    if (notification.type === 'follow_request') {
      return `${actorName} sent you a follow request.`
    }

    if (notification.type === 'follow_accepted') {
      return `${actorName} accepted your follow request.`
    }

    return notification.content
  }

  function actorInitials(notification: Notification) {
    const actor = notification.actor_id ? profilesById[notification.actor_id] : undefined
    const base = actor?.full_name || actor?.username || 'U'
    return base
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  }

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Please Log In</h1>
            <p className="text-secondary-text mb-6">You need to be logged in to view notifications.</p>
            <Button onClick={() => router.push('/login')} size="sm" className="px-6 py-2 rounded-md">
              Go to Login
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Notifications</h1>
          <Button
            onClick={clearAllNotifications}
            size="sm"
            variant="secondary"
            disabled={unreadCount === 0}
            className="px-4 py-2 rounded-md"
          >
            Clear All Notifications
          </Button>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="glass rounded-xl p-8 border border-white/10 text-center">
              <p className="text-secondary-text">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-xl border p-5 transition-colors ${
                  notification.read
                    ? 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900/60'
                    : 'border-indigo-300 bg-indigo-50 dark:border-indigo-400/40 dark:bg-indigo-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    {notification.actor_id && profilesById[notification.actor_id] ? (
                      <Avatar
                        user={profilesById[notification.actor_id]}
                        size="small"
                        className="flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 flex-shrink-0">
                        U
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-slate-800 dark:text-slate-100">{renderNotificationText(notification)}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {notification.type === 'message' && (
                      <>
                        <button
                          onClick={() => router.push(`/chat?user=${notification.actor_id}`)}
                          className="rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Open in Chat
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {notification.type === 'follow_request' && (
                      <>
                        {!notification.read && (
                          <>
                            <button
                              onClick={() => acceptFollowRequest(notification)}
                              className="rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectFollowRequest(notification)}
                              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Deny
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {notification.type !== 'message' && notification.type !== 'follow_request' && (
                      <>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'

type Notification = {
  id: string
  user_id: string
  type: string
  content: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function check() {
      const { data } = await supabase.auth.getSession()
      const session = data?.session

      if (!mounted) return
      if (!session) {
        setLoading(false)
        return
      }
      setUser(session.user)
      await fetchNotifications(session.user.id)
      setLoading(false)
    }
    check()
    return () => {
      mounted = false
    }
  }, [])

  async function fetchNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  async function acceptFollowRequest(notificationId: string, senderId: string) {
    try {
      // Update the follow request to accepted
      const { error: updateError } = await supabase
        .from('follows')
        .update({ status: 'accepted' })
        .eq('follower_id', senderId)
        .eq('following_id', user.id)

      if (updateError) throw updateError

      // Mark notification as read
      await markAsRead(notificationId)

      // Create a notification for the sender that their request was accepted
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: senderId,
        type: 'follow_accepted',
        content: 'Your follow request was accepted',
        is_read: false,
      })

      if (notificationError) {
        console.error('Error creating acceptance notification:', notificationError)
      }

      // Remove this notification from the list
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error accepting follow request:', err)
    }
  }

  async function rejectFollowRequest(notificationId: string, senderId: string) {
    try {
      // Delete the follow request
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', senderId)
        .eq('following_id', user.id)

      if (deleteError) throw deleteError

      // Mark notification as read and remove from list
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error rejecting follow request:', err)
    }
  }

  function parseFollowRequest(notification: Notification) {
    if (notification.type === 'follow_request' && notification.content.startsWith('FOLLOW_REQUEST:')) {
      const parts = notification.content.split(':')
      if (parts.length >= 3) {
        const senderId = parts[1]
        const senderName = parts.slice(2).join(':')
        return { senderId, senderName }
      }
    }
    return null
  }

  function formatNotificationContent(notification: Notification) {
    switch (notification.type) {
      case 'follow_request':
        return 'Someone sent you a follow request'
      case 'follow_accepted':
        return 'Your follow request was accepted'
      case 'message':
        return 'You have a new message'
      default:
        return notification.content
    }
  }

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
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
            <Button
              onClick={() => router.push('/login')}
              size="sm"
              className="px-6 py-2 rounded-md"
            >
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
        <h1 className="text-3xl font-display font-semibold mb-8">Notifications</h1>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="glass rounded-xl p-8 border border-white/10 text-center">
              <p className="text-secondary-text">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification, index) => {
              const followRequestData = parseFollowRequest(notification)
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-xl p-6 border transition-all ${
                    notification.is_read
                      ? 'border-white/10 bg-white/5'
                      : 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10'
                  } ${notification.type === 'follow_request' ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={() => notification.type !== 'follow_request' && !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${notification.is_read ? 'text-secondary-text' : 'text-slate-900 dark:text-white'}`}>
                        {followRequestData ? `${followRequestData.senderName} sent you a follow request` : formatNotificationContent(notification)}
                      </p>
                      <p className="text-xs text-secondary-text/70 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {followRequestData && !notification.is_read && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            acceptFollowRequest(notification.id, followRequestData.senderId)
                          }}
                          className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            rejectFollowRequest(notification.id, followRequestData.senderId)
                          }}
                          className="px-4 py-2 rounded-md glass border border-white/10 text-secondary-text hover:border-white/20 transition-all text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {!followRequestData && !notification.is_read && (
                      <div className="w-2 h-2 bg-cyan-400 rounded-full ml-4"></div>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
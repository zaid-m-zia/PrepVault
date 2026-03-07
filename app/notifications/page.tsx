'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import { motion } from 'framer-motion'

type Notification = {
  id: string
  user_id: string
  type: string
  content: string
  read: boolean
  created_at: string
  actor_id?: string
  related_id?: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function check() {
      const { data }: any = await supabase.auth.getUser()
      if (!mounted) return
      if (!data?.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
      await fetchNotifications(data.user.id)
      setLoading(false)
    }
    check()
    return () => {
      mounted = false
    }
  }, [router])

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
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
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

  if (loading) return null

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
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass rounded-xl p-6 border transition-all cursor-pointer ${
                  notification.read
                    ? 'border-white/10 bg-white/5'
                    : 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${notification.read ? 'text-secondary-text' : 'text-white'}`}>
                      {formatNotificationContent(notification)}
                    </p>
                    <p className="text-xs text-secondary-text/70 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full ml-4"></div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
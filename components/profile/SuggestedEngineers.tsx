'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import Link from 'next/link'
import FollowButton from './FollowButton'
import { motion } from 'framer-motion'

type SuggestedUser = {
  id: string
  username: string
  full_name?: string
  bio?: string
}

export default function SuggestedEngineers() {
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [followStatusMap, setFollowStatusMap] = useState<Record<string, string | undefined>>({})
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSuggestedUsers()
  }, [])

  useEffect(() => {
    if (!currentUser?.id || users.length === 0) return

    const channel = supabase
      .channel(`suggested-follow-sync-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_requests',
          filter: `sender_id=eq.${currentUser.id}`,
        },
        () => {
          void refreshFollowState(currentUser.id, users)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${currentUser.id}`,
        },
        () => {
          void refreshFollowState(currentUser.id, users)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser?.id, users])

  async function refreshFollowState(currentUserId: string, suggestedUsers: SuggestedUser[]) {
    const suggestedIds = suggestedUsers.map((profile) => profile.id)
    if (suggestedIds.length === 0) {
      setFollowingMap({})
      setFollowStatusMap({})
      return
    }

    const [{ data: followerRows }, { data: requestRows }] = await Promise.all([
      supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', suggestedIds),
      supabase
        .from('follow_requests')
        .select('receiver_id, status, created_at')
        .eq('sender_id', currentUserId)
        .in('receiver_id', suggestedIds)
        .order('created_at', { ascending: false }),
    ])

    const followingState: Record<string, boolean> = {}
    for (const row of (followerRows || []) as Array<{ following_id: string }>) {
      followingState[row.following_id] = true
    }

    const requestState: Record<string, string | undefined> = {}
    for (const row of (requestRows || []) as Array<{ receiver_id: string; status: string | null }>) {
      if (requestState[row.receiver_id]) continue
      requestState[row.receiver_id] = row.status || 'pending'
    }

    setFollowingMap(followingState)
    setFollowStatusMap(requestState)
  }

  async function fetchSuggestedUsers() {
    try {
      const { data: user } = await supabase.auth.getUser()
      setCurrentUser(user?.user)

      if (!user?.user) {
        setLoading(false)
        return
      }

      // Get profiles that the current user is not following
      const { data: suggested } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio')
        .neq('id', user.user.id)
        .limit(6)

      if (suggested) {
        const typedSuggested = suggested as SuggestedUser[]
        setUsers(typedSuggested)

        const suggestedIds = typedSuggested.map((profile: SuggestedUser) => profile.id)

        if (suggestedIds.length > 0) {
          await refreshFollowState(user.user.id, typedSuggested)
        }
      }
    } catch (e) {
      console.error('Error fetching suggested users:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-secondary-text">Loading suggestions...</div>
  }

  if (!currentUser) {
    return null
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-display font-semibold mb-6">Suggested Engineers</h2>

      {users.length === 0 ? (
        <div className="glass rounded-lg p-8 border border-white/10 text-center text-secondary-text">
          <p>No suggestions available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg glass border border-white/10 flex items-center justify-center text-lg font-bold">
                  {(user.full_name || user.username)
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
              </div>

              <Link href={`/profile/${user.id}`} className="block hover:text-primary-text">
                <h3 className="text-lg font-semibold">{user.full_name || user.username}</h3>
                <p className="text-sm text-secondary-text">@{user.username}</p>
              </Link>

              {user.bio && (
                <p className="mt-3 text-sm text-secondary-text line-clamp-2">{user.bio}</p>
              )}

              <div className="mt-4">
                <FollowButton
                  profileId={user.id}
                  currentStatus={followStatusMap[user.id]}
                  isFollowed={Boolean(followingMap[user.id])}
                  onStatusChange={(nextStatus) => {
                    setFollowStatusMap((prev) => ({ ...prev, [user.id]: nextStatus }))
                    if (nextStatus === 'accepted') {
                      setFollowingMap((prev) => ({ ...prev, [user.id]: true }))
                    }
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

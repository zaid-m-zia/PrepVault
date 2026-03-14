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

  useEffect(() => {
    fetchSuggestedUsers()
  }, [])

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
        setUsers(suggested)
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
                <FollowButton profileId={user.id} currentStatus={undefined} isFollowed={false} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

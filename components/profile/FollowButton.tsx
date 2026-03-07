'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import { motion } from 'framer-motion'

type FollowButtonProps = {
  profileId: string
  currentStatus?: string
  isFollowed: boolean
}

export default function FollowButton({ profileId, currentStatus, isFollowed }: FollowButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | undefined>(currentStatus)

  // Update status when props change
  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  async function handleFollow() {
    setLoading(true)

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        router.push('/login')
        return
      }

      // Check if already following or pending
      const isAlreadyFollowing = isFollowed || status === 'pending' || currentStatus === 'pending' || currentStatus === 'accepted'
      
      if (isAlreadyFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.user.id)
          .eq('following_id', profileId)

        setStatus(undefined)
      } else {
        // Follow
        const { error } = await supabase.from('follows').insert({
          follower_id: user.user.id,
          following_id: profileId,
          status: 'pending',
        })

        if (error) {
          console.error('Follow error:', error)
          setLoading(false)
          return
        }

        setStatus('pending')

        // Create notification for the receiver
        await supabase.from('notifications').insert({
          user_id: profileId,
          actor_id: user.user.id,
          type: 'follow_request',
          related_id: user.user.id,
        })
      }
    } catch (e) {
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const isAlreadyFollowing = isFollowed || status === 'pending' || currentStatus === 'pending' || currentStatus === 'accepted'

  return (
    <motion.button
      onClick={handleFollow}
      disabled={loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-2 rounded-md font-semibold transition-all ${
        isAlreadyFollowing
          ? 'glass border border-white/10 text-secondary-text hover:border-white/20'
          : 'bg-accent text-[#0a0e27] hover:shadow-lg'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Loading...' : isAlreadyFollowing ? (isFollowed ? 'Following' : 'Requested') : 'Follow'}
    </motion.button>
  )
}

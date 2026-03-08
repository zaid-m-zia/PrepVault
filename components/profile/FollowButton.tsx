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
        // Instead of redirecting, show an alert or handle gracefully
        alert('Please log in to follow users')
        setLoading(false)
        return
      }

      // Check if already following or pending
      const isAlreadyFollowing = isFollowed || status === 'pending' || currentStatus === 'pending' || currentStatus === 'accepted'
      
      if (isAlreadyFollowing) {
        console.log('Unfollowing user:', profileId)
        // Unfollow
        const { error: unfollowError } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.user.id)
          .eq('following_id', profileId)

        if (unfollowError) {
          console.error('Unfollow error:', unfollowError)
          setLoading(false)
          return
        }

        setStatus(undefined)
      } else {
        console.log('Following user:', profileId, 'from user:', user.user.id)
        
        // Step 1: Insert into follows table
        const { error: followError } = await supabase.from('follows').insert({
          follower_id: user.user.id,
          following_id: profileId,
          status: 'pending',
        })

        if (followError) {
          console.error('Follow insert error:', followError)
          setLoading(false)
          return
        }

        console.log('Follow request inserted successfully')
        setStatus('pending')

        // Step 2: Create notification for the receiver (don't fail follow if notification fails)
        const userName = user.user.user_metadata?.full_name || user.user.email || 'Someone'
        const { error: notificationError } = await supabase.from('notifications').insert({
          user_id: profileId,
          type: 'follow_request',
          content: `${userName} sent you a follow request`,
          is_read: false,
        })

        if (notificationError) {
          console.error('Notification insert error:', notificationError)
          // Don't fail the follow request if notification fails
        } else {
          console.log('Notification created successfully')
        }
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

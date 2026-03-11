'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import { motion } from 'framer-motion'

type FollowButtonProps = {
  profileId: string
  currentStatus?: string
  isFollowed: boolean
  onStatusChange?: (newStatus?: string) => void
}

export default function FollowButton({ profileId, currentStatus, isFollowed, onStatusChange }: FollowButtonProps) {
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
      const { data } = await supabase.auth.getSession()
      const session = data?.session

      if (!session) {
        // Instead of redirecting, show an alert or handle gracefully
        alert('Please log in to follow users')
        setLoading(false)
        return
      }

      // First, check current follow status from database to prevent race conditions
      const { data: currentFollow } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', session.user.id)
        .eq('following_id', profileId)
        .maybeSingle()

      const isCurrentlyFollowing = currentFollow?.status === 'accepted'
      const isPending = currentFollow?.status === 'pending'
      
      if (isCurrentlyFollowing || isPending) {
        console.log('Unfollowing user:', profileId)
        // Unfollow
        const { error: unfollowError } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', profileId)

        if (unfollowError) {
          console.error('Unfollow error:', unfollowError)
          setLoading(false)
          return
        }

        setStatus(undefined)
        onStatusChange?.(undefined)
      } else {
        console.log('Following user:', profileId, 'from user:', session.user.id)
        
        // Step 1: Insert into follows table
        const { error: followError } = await supabase.from('follows').insert({
          follower_id: session.user.id,
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
        onStatusChange?.('pending')

        // Step 2: Create notification for the receiver (don't fail follow if notification fails)
        const userName = session.user.user_metadata?.full_name || session.user.email || 'Someone'
        const { error: notificationError } = await supabase.from('notifications').insert({
          user_id: profileId,
          type: 'follow_request',
          content: `FOLLOW_REQUEST:${session.user.id}:${userName}`,
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
          : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Loading...' : isAlreadyFollowing ? (isFollowed ? 'Following' : 'Requested') : 'Follow'}
    </motion.button>
  )
}

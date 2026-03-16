'use client'

import { useState, useEffect } from 'react'
import supabase from '../../lib/supabaseClient'
import { createNotification } from '../../lib/notifications'
import Button from '../ui/Button'

type FollowButtonProps = {
  profileId: string
  currentStatus?: string
  isFollowed: boolean
  onStatusChange?: (newStatus?: string) => void
}

export default function FollowButton({ profileId, currentStatus, isFollowed, onStatusChange }: FollowButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | undefined>(currentStatus)

  // Update status when props change
  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  async function handleFollow() {
    if (loading) return
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

      // Check existing follow relationship first
      const { data: existingFollower } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', session.user.id)
        .eq('following_id', profileId)
        .maybeSingle()

      if (existingFollower) {
        setStatus('accepted')
        onStatusChange?.('accepted')
        return
      }

      // Before insert, check if request already exists
      const { data: existingRequest } = await supabase
        .from('follow_requests')
        .select('*')
        .eq('sender_id', session.user.id)
        .eq('receiver_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingRequest) {
        const existingStatus = existingRequest.status || 'pending'
        setStatus(existingStatus)
        onStatusChange?.(existingStatus)
        return
      }

      const { data: createdRequest, error: requestError } = await supabase
        .from('follow_requests')
        .insert({
          sender_id: session.user.id,
          receiver_id: profileId,
          status: 'pending',
        })
        .select('id, status')
        .single()

      if (requestError || !createdRequest) {
        throw requestError || new Error('Failed to create follow request')
      }

      setStatus(createdRequest.status || 'pending')
      onStatusChange?.(createdRequest.status || 'pending')

      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', profileId)
        .eq('entity_id', createdRequest.id)
        .eq('type', 'follow_request')
        .maybeSingle()

      if (!existingNotification) {
        const userName = session.user.user_metadata?.full_name || session.user.email || 'Someone'
        const { error: notificationError } = await createNotification({
          user_id: profileId,
          actor_id: session.user.id,
          type: 'follow_request',
          entity_id: createdRequest.id,
          content: `FOLLOW_REQUEST:${createdRequest.id}:${session.user.id}:${userName}`,
          read: false,
          dedupe: true,
        })

        if (notificationError) {
          console.error('Notification insert error:', notificationError)
        }
      }
    } catch (e) {
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const isAlreadyFollowing = isFollowed || status === 'pending' || currentStatus === 'pending' || currentStatus === 'accepted'
  const effectiveStatus = isFollowed || status === 'accepted' || currentStatus === 'accepted'
    ? 'following'
    : status === 'pending' || currentStatus === 'pending'
      ? 'requested'
      : 'follow'

  return (
    <Button
      onClick={handleFollow}
      disabled={loading || isAlreadyFollowing}
      size="md"
      variant={isAlreadyFollowing ? 'secondary' : 'primary'}
      className="px-6"
    >
      {loading ? 'Loading...' : effectiveStatus === 'following' ? 'Following' : effectiveStatus === 'requested' ? 'Requested' : 'Follow'}
    </Button>
  )
}

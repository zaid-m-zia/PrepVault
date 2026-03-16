'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import supabase from '../../lib/supabaseClient'
import Avatar from '../ui/Avatar'
import FollowButton from './FollowButton'

type UserEntry = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  followStatus?: string
  isFollowed: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
  profileId: string
  currentUserId: string | null
  type: 'followers' | 'following'
}

export default function FollowListModal({ isOpen, onClose, profileId, currentUserId, type }: Props) {
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<UserEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setUsers([])
    void fetchUsers()
  }, [isOpen, profileId, type])

  async function fetchUsers() {
    setLoading(true)
    try {
      let profiles: any[] = []

      if (type === 'followers') {
        const { data: rows } = await supabase
          .from('followers')
          .select('profiles!follower_id(id, username, full_name, avatar_url)')
          .eq('following_id', profileId)
        profiles = (rows || []).map((r: any) => r.profiles).filter(Boolean)
      } else {
        const { data: rows } = await supabase
          .from('followers')
          .select('profiles!following_id(id, username, full_name, avatar_url)')
          .eq('follower_id', profileId)
        profiles = (rows || []).map((r: any) => r.profiles).filter(Boolean)
      }

      if (currentUserId && profiles.length > 0) {
        const ids = profiles.map((u: any) => u.id)
        const [{ data: followingRows }, { data: requestRows }] = await Promise.all([
          supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', currentUserId)
            .in('following_id', ids),
          supabase
            .from('follow_requests')
            .select('receiver_id, status')
            .eq('sender_id', currentUserId)
            .in('receiver_id', ids),
        ])

        const followingSet = new Set((followingRows || []).map((r: any) => r.following_id))
        const requestMap = new Map((requestRows || []).map((r: any) => [r.receiver_id, r.status]))

        profiles = profiles.map((u: any) => ({
          ...u,
          isFollowed: followingSet.has(u.id),
          followStatus: followingSet.has(u.id) ? 'accepted' : requestMap.get(u.id),
        }))
      } else {
        profiles = profiles.map((u: any) => ({ ...u, isFollowed: false }))
      }

      setUsers(profiles)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-white/10 bg-white dark:bg-slate-900 shadow-2xl max-h-[80dvh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              Loading...
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </div>
          )}

          {!loading &&
            users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 py-2">
                <Avatar user={user} size="small" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.full_name || user.username}
                  </p>
                  {user.username && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                  )}
                </div>
                {currentUserId && currentUserId !== user.id && (
                  <FollowButton
                    profileId={user.id}
                    currentStatus={user.followStatus}
                    isFollowed={user.isFollowed}
                    onStatusChange={(newStatus) => {
                      setUsers((prev) =>
                        prev.map((u) =>
                          u.id === user.id
                            ? { ...u, followStatus: newStatus, isFollowed: newStatus === 'accepted' }
                            : u
                        )
                      )
                    }}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

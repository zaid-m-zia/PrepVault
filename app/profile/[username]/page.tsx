'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import FollowButton from '../../../components/profile/FollowButton'
import MessageButton from '../../../components/profile/MessageButton'
import EditProfileForm from '../../../components/profile/EditProfileForm'
import { motion } from 'framer-motion'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [followStatus, setFollowStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        setUser(userData)

        // Fetch profile by username
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', params.username)
          .single()

        if (error || !profileData) {
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Check if current user is following this profile
        if (userData?.user) {
          const { data: follow } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', userData.user.id)
            .eq('following_id', profileData.id)
            .maybeSingle()

          setFollowStatus(follow)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.username, supabase, router])

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white/10 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-8 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Profile Not Found</h1>
            <p className="text-secondary-text mb-6">The user you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 rounded-md bg-accent text-[#0a0e27] font-semibold hover:shadow-lg transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </section>
    )
  }

  const isOwnProfile = user?.user?.id === profile.id

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile)
    setEditing(false)
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="glass rounded-xl p-8 border border-white/10 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-lg glass border border-white/10 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {profile.full_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase() || profile.username.charAt(0).toUpperCase()}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-display font-bold">{profile.full_name || profile.username}</h1>
              <p className="text-lg text-secondary-text">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-3 text-secondary-text">{profile.bio}</p>
              )}
              {profile.created_at && (
                <p className="mt-2 text-xs text-secondary-text">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}

              {/* Action Buttons */}
              {!isOwnProfile && user?.user && (
                <div className="flex gap-3 mt-4">
                  <FollowButton
                    profileId={profile.id}
                    currentStatus={followStatus?.status}
                    isFollowed={followStatus?.status === 'accepted'}
                  />
                  <MessageButton profileId={profile.id} username={profile.username} />
                </div>
              )}

              {/* Edit Profile Button for own profile */}
              {isOwnProfile && !editing && (
                <motion.button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-6 py-2 rounded-md bg-accent text-[#0a0e27] font-semibold hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Profile
                </motion.button>
              )}

              {/* Edit Profile Form */}
              {isOwnProfile && editing && (
                <div className="mt-6">
                  <EditProfileForm
                    profile={profile}
                    onSave={handleProfileUpdate}
                    onCancel={() => setEditing(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Show extended sections only if following or own profile */}
        {(isOwnProfile || followStatus?.status === 'accepted') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-lg p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-secondary-text">Skills</h3>
              <p className="mt-3 text-sm">Add skills to your profile</p>
            </div>

            <div className="glass rounded-lg p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-secondary-text">Teams</h3>
              <p className="mt-3 text-sm">No teams yet</p>
            </div>

            <div className="glass rounded-lg p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-secondary-text">Resources</h3>
              <p className="mt-3 text-sm">Your shared resources</p>
            </div>
          </div>
        )}

        {/* Message info for non-followers */}
        {!isOwnProfile && !followStatus && user?.user && (
          <div className="glass rounded-lg p-6 border border-white/10 bg-white/3">
            <p className="text-sm text-secondary-text">
              Follow to see more details and start messaging
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

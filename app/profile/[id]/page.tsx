'use client'

import { useState, useEffect } from 'react'
import supabase from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import FollowButton from '../../../components/profile/FollowButton'
import MessageButton from '../../../components/profile/MessageButton'
import EditProfileForm from '../../../components/profile/EditProfileForm'
import SuggestedEngineers from '../../../components/profile/SuggestedEngineers'
import Button from '../../../components/ui/Button'
import { motion } from 'framer-motion'

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [followStatus, setFollowStatus] = useState<any>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        setUser(session?.user || null)

        // Fetch profile by id (UUID)
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error || !profileData) {
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Check if current user is following this profile
        if (session?.user) {
          const { data: follow } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', session.user.id)
            .eq('following_id', profileData.id)
            .maybeSingle()

          setFollowStatus(follow)
        }

        // Get follower count (people following this profile)
        const { count: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileData.id)
          .eq('status', 'accepted')

        // Get following count (people this profile is following)
        const { count: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileData.id)
          .eq('status', 'accepted')

        setFollowerCount(followers || 0)
        setFollowingCount(following || 0)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

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
            <Button
              onClick={() => router.push('/')}
              size="sm"
              className="px-6 py-2 rounded-md"
            >
              Go Home
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const isOwnProfile = user?.id === profile.id

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
                <p className="mt-3 text-secondary-text" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{profile.bio}</p>
              )}
              
              {/* Follower/Following Counts */}
              <div className="flex gap-6 mt-3">
                <div className="text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">{followerCount}</span>
                  <span className="text-secondary-text ml-1">Followers</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">{followingCount}</span>
                  <span className="text-secondary-text ml-1">Following</span>
                </div>
              </div>

              {profile.created_at && (
                <p className="mt-2 text-xs text-secondary-text">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}

              {/* Action Buttons */}
              {!isOwnProfile && user && (
                <div className="flex gap-3 mt-4">
                  <FollowButton
                    profileId={profile.id}
                    currentStatus={followStatus?.status}
                    isFollowed={followStatus?.status === 'accepted'}
                    onStatusChange={async (newStatus) => {
                      setFollowStatus(newStatus ? { ...followStatus, status: newStatus } : null)
                      
                      // Refresh follower/following counts
                      if (profile) {
                        const { count: followers } = await supabase
                          .from('follows')
                          .select('*', { count: 'exact', head: true })
                          .eq('following_id', profile.id)
                          .eq('status', 'accepted')
                        
                        const { count: following } = await supabase
                          .from('follows')
                          .select('*', { count: 'exact', head: true })
                          .eq('follower_id', profile.id)
                          .eq('status', 'accepted')
                        
                        setFollowerCount(followers || 0)
                        setFollowingCount(following || 0)
                      }
                    }}
                  />
                  <MessageButton profileId={profile.id} username={profile.username} />
                </div>
              )}

              {/* Edit Profile Button for own profile */}
              {isOwnProfile && !editing && (
                <motion.button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-6 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
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
          <div className="space-y-4 mb-8">
            {/* College + Branch */}
            {(profile?.college || profile?.branch) && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile?.college && (
                    <div>
                      <p className="text-xs text-secondary-text">College</p>
                      <p className="mt-1 text-sm font-medium">{profile.college}</p>
                    </div>
                  )}
                  {profile?.branch && (
                    <div>
                      <p className="text-xs text-secondary-text">Branch</p>
                      <p className="mt-1 text-sm font-medium">{profile.branch}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {Array.isArray(profile?.skills) && profile.skills.length > 0 && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <p className="text-sm font-semibold text-secondary-text mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s: string) => (
                    <span key={s} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(profile?.github || profile?.linkedin || profile?.leetcode) && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <p className="text-sm font-semibold text-secondary-text mb-3">Links</p>
                <div className="flex flex-wrap gap-3">
                  {profile?.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition">
                      GitHub
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition">
                      LinkedIn
                    </a>
                  )}
                  {profile?.leetcode && (
                    <a href={profile.leetcode} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition">
                      LeetCode
                    </a>
                  )}
                </div>
              </div>
            )}
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

        {/* Suggested Engineers — only shown on own profile */}
        {isOwnProfile && <SuggestedEngineers />}
      </div>
    </section>
  )
}

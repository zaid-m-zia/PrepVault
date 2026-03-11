'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import SuggestedEngineers from '../../components/profile/SuggestedEngineers'
import EditProfileForm from '../../components/profile/EditProfileForm'
import Button from '../../components/ui/Button'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    let mounted = true
    async function check() {
      const { data } = await supabase.auth.getSession()
      const session = data?.session

      if (!mounted) return
      if (!session) {
        setLoading(false)
        return
      }
      setUser(session.user)

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }
      setLoading(false)
    }
    check()
    const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) setUser(session.user)
      else setUser(null)
    })
    const subscription = data?.subscription
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Please Log In</h1>
            <p className="text-secondary-text mb-6">You need to be logged in to view your profile.</p>
            <Button
              onClick={() => router.push('/login')}
              size="sm"
              className="px-6 py-2 rounded-md"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Loading Profile...</h1>
            <p className="text-secondary-text">Please wait while we load your profile data.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-semibold">Your Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-md glass border border-white/10 hover:border-white/20 transition-all"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <EditProfileForm
            profile={profile}
            onSave={(updatedProfile) => {
              setProfile(updatedProfile)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            {/* User Profile Info */}
            <div className="glass rounded-xl p-8 border border-white/10 mb-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-lg glass border border-white/10 flex items-center justify-center text-2xl font-bold">
                  {(profile?.full_name || user?.email)
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{profile?.full_name || 'User'}</h2>
                  <p className="text-secondary-text">@{profile?.username || user?.email}</p>
                  {profile?.bio && (
                    <p className="mt-2 text-secondary-text">{profile.bio}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/3 rounded-md">
                  <p className="text-xs text-secondary-text">Email</p>
                  <p className="mt-1 text-sm font-medium">{user?.email}</p>
                </div>
                <div className="p-3 bg-white/3 rounded-md">
                  <p className="text-xs text-secondary-text">Phone</p>
                  <p className="mt-1 text-sm font-medium">{profile?.phone || '—'}</p>
                </div>
              </div>
            </div>

            {/* Suggested Engineers Section */}
            <SuggestedEngineers />
          </>
        )}
      </div>
    </section>
  )
}


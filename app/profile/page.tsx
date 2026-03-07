'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import SuggestedEngineers from '../../components/profile/SuggestedEngineers'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function check() {
      const { data }: any = await supabase.auth.getUser()
      if (!mounted) return
      if (!data?.user) {
        router.push('/login')
        return
      }
      setUser(data.user)

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }
      setLoading(false)
    }
    check()
    const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) setUser(session.user)
      else router.push('/login')
    })
    const subscription = data?.subscription
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router])

  if (loading) return null

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-semibold mb-8">Your Profile</h1>

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
      </div>
    </section>
  )
}


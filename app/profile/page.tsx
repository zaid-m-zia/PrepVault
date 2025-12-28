'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
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
    <section className="py-8">
      <h1 className="text-xl font-display font-semibold">Profile</h1>
      <div className="mt-4 glass rounded-md p-4 border border-white/10 max-w-xl">
        <p className="text-sm">User ID: <code className="text-xs bg-transparent">{user?.id}</code></p>
        <p className="mt-2 text-sm">Email: <span className="font-medium">{user?.email ?? '—'}</span></p>
      </div>
    </section>
  )
}

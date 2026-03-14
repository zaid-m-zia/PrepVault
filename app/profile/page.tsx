'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      if (session?.user?.id) {
        router.replace(`/profile/${session.user.id}`)
      } else {
        router.replace('/login')
      }
    }
    redirect()
  }, [router])

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-xl p-8 border border-white/10">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function signIn() {
    setLoading(true)
    setMessage(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }
    if (data?.user) {
      router.push('/profile')
    }
  }

  async function signUp() {
    setLoading(true)
    setMessage(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }
    // Sign up often requires email confirmation — still navigate to profile if the SDK returned a user
    if (data?.user) router.push('/profile')
    else setMessage('Check your email for confirmation (if required).')
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-4">Sign in / Sign up</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            signIn()
          }}
          className="glass rounded-xl p-6 border border-white/10"
        >
          <label className="block mb-3">
            <div className="text-sm text-secondary-text mb-1">Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded-md bg-transparent border border-white/6" />
          </label>

          <label className="block mb-4">
            <div className="text-sm text-secondary-text mb-1">Password</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 rounded-md bg-transparent border border-white/6" />
          </label>

          {message && <div className="text-sm text-rose-400 mb-3">{message}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-accent text-[#0a0e27] px-4 py-2 rounded-md font-semibold">{loading ? 'Signing in...' : 'Sign in'}</button>
            <button type="button" onClick={signUp} disabled={loading} className="glass px-4 py-2 rounded-md border">{loading ? 'Please wait...' : 'Sign up'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}

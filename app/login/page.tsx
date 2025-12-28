'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [isSignup, setIsSignup] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)

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
    // Basic front-end validation
    if (!username.trim() || !fullName.trim() || !phone.trim() || !email.trim() || !password) {
      setMessage('Please fill all required fields.')
      return
    }

    setLoading(true)
    setMessage(null)
    setUsernameError(null)

    try {
      // Check if username already exists
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .limit(1)
        .maybeSingle()

      if (checkError) {
        setMessage('Error checking username availability.')
        setLoading(false)
        return
      }

      if (existing) {
        setUsernameError('Username already taken, please choose another.')
        setMessage(null)
        setLoading(false)
        return
      }

      // Create the user via Supabase auth
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const user = data?.user

      if (!user) {
        // If user is not present (e.g., confirmation required), inform user
        setMessage('Check your email for confirmation (if required).')
        setLoading(false)
        return
      }

      // Insert profile record
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        username,
        full_name: fullName,
        phone,
        email,
      })

      if (insertError) {
        // Handle unique constraint race or other DB errors
        // If username unique constraint triggered, show friendly message
        if (insertError.code === '23505' || /unique/i.test(insertError.message || '')) {
          setUsernameError('Username already taken, please choose another.')
          setMessage(null)
        } else {
          setMessage(insertError.message || 'Failed to create profile.')
        }
        setLoading(false)
        return
      }

      // Success — navigate to profile
      setLoading(false)
      router.push('/profile')
    } catch (e: any) {
      setMessage(e?.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-4">{isSignup ? 'Create an account' : 'Sign in'}</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            isSignup ? signUp() : signIn()
          }}
          className="glass rounded-xl p-6 border border-white/10"
        >
          {/* Signup fields */}
          {isSignup && (
            <>
              <label className="block mb-3">
                <div className="text-sm text-secondary-text mb-1">Full name <span className="text-xs text-secondary-text">(required)</span></div>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" className="w-full px-3 py-2 rounded-md bg-transparent border border-white/6" aria-required />
              </label>

              <label className="block mb-3">
                <div className="text-sm text-secondary-text mb-1">Username <span className="text-xs text-secondary-text">(required)</span></div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  className={`w-full px-3 py-2 rounded-md bg-transparent border ${usernameError ? 'border-rose-400' : 'border-white/6'}`}
                  aria-required
                />
                {usernameError && <p className="mt-2 text-xs text-rose-400">{usernameError}</p>}
              </label>

              <label className="block mb-3">
                <div className="text-sm text-secondary-text mb-1">Phone number <span className="text-xs text-secondary-text">(required)</span></div>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" className="w-full px-3 py-2 rounded-md bg-transparent border border-white/6" aria-required />
              </label>
            </>
          )}

          {/* Email + Password always shown */}
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
            <button type="submit" disabled={loading} className="bg-accent text-[#0a0e27] px-4 py-2 rounded-md font-semibold">{loading ? (isSignup ? 'Registering...' : 'Signing in...') : (isSignup ? 'Sign up' : 'Login')}</button>
            {!isSignup && (
              <button type="button" onClick={() => { setIsSignup(true); setMessage(null); }} className="glass px-4 py-2 rounded-md border">Register</button>
            )}
          </div>

          <div className="mt-4 text-sm text-secondary-text">
            {isSignup ? (
              <p>Already have an account? <button type="button" onClick={() => { setIsSignup(false); setMessage(null); }} className="underline">Login</button></p>
            ) : (
              <p>Don't have an account? <button type="button" onClick={() => { setIsSignup(true); setMessage(null); }} className="underline">Register here</button></p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { motion } from 'framer-motion'

type EditProfileFormProps = {
  profile: any
  onSave: (updatedProfile: any) => void
  onCancel: () => void
}

export default function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      if (!session) throw new Error('Not authenticated')

      const { data: updatedData, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          avatar_url: formData.avatar_url
        })
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) throw error

      onSave(updatedData)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-8 border border-white/10 mb-8"
    >
      <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              placeholder="Enter your username"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Avatar URL</label>
          <input
            type="url"
            value={formData.avatar_url}
            onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="flex gap-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-accent text-[#0a0e27] font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>

          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 glass border border-white/10 text-secondary-text hover:border-white/20 rounded-lg transition"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
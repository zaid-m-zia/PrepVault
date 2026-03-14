'use client'

import { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { motion } from 'framer-motion'
import Button from '../ui/Button'

type EditProfileFormProps = {
  profile: any
  onSave: (updatedProfile: any) => void
  onCancel: () => void
}

export default function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
  const initialSkills = Array.isArray(profile?.skills)
    ? profile.skills.filter((skill: unknown) => typeof skill === 'string' && skill.trim())
    : []

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    skills: initialSkills as string[]
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addSkill(value: string) {
    const normalized = value.trim()
    if (!normalized) return

    setFormData((prev) => {
      if (prev.skills.some((skill) => skill.toLowerCase() === normalized.toLowerCase())) {
        return prev
      }
      return { ...prev, skills: [...prev.skills, normalized] }
    })
  }

  function removeSkill(skillToRemove: string) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove)
    }))
  }

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
          avatar_url: formData.avatar_url,
          skills: formData.skills
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
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
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Avatar URL</label>
          <input
            type="url"
            value={formData.avatar_url}
            onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Skills (press Enter)</label>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSkill(skillInput)
                setSkillInput('')
              }
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Add a skill and press Enter"
          />

          {formData.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text"
                >
                  {skill} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>

          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-white border border-gray-300 text-slate-900 hover:bg-gray-100 rounded-lg transition dark:bg-transparent dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}